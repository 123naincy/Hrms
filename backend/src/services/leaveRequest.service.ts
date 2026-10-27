import mongoose from "mongoose";

import {
  abortOptionalTransaction,
  beginOptionalTransaction,
  commitOptionalTransaction,
} from "../utils/transaction";
import LeaveRequest from "../models/LeaveRequest";
import LeaveBalance from "../models/LeaveBalance";
import LeavePolicy from "../models/LeavePolicy";
import User from "../models/User";
import { LeaveCalculationService,} from "./leaveCalculation.service";

export class LeaveRequestService {
  private calculationService =
    new LeaveCalculationService();

  // =====================================================
  // APPLY LEAVE
  // =====================================================

  async applyLeave(
    employeeId: string,
    data: {
      leaveType:
        | "EL"
        | "CSL"
        | "MATERNITY"
        | "BEREAVEMENT";

      startDate: string;

      endDate: string;

      dayType:
        | "FULL_DAY"
        | "FIRST_HALF"
        | "SECOND_HALF";

      reason: string;

      attachment?: string;

      relationship?: string;

      childNumber?: number;
    }
  ) {

    // ===================================================
    // 1. FIND EMPLOYEE
    // ===================================================

    const employee =
      await User.findById(employeeId);

    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }

    if (!employee.isActive) {
      throw new Error(
        "Employee account is inactive"
      );
    }

    // ===================================================
    // 2. VALIDATE REASON
    // ===================================================

    if (!data.reason?.trim()) {
      throw new Error(
        "Leave reason is required"
      );
    }

    // ===================================================
    // 3. VALIDATE DATES
    // ===================================================

    const startDate =
      new Date(data.startDate);

    const endDate =
      new Date(data.endDate);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      throw new Error(
        "Invalid leave dates"
      );
    }

    if (startDate > endDate) {
      throw new Error(
        "Start date cannot be after end date"
      );
    }

    // ===================================================
    // 4. GET POLICY
    // ===================================================

    const policy =
      await LeavePolicy.findOne({
        code: data.leaveType,

        isActive: true,

        effectiveFrom: {
          $lte: startDate,
        },

        $or: [
          {
            effectiveTo: {
              $gte: startDate,
            },
          },
          {
            effectiveTo: null,
          },
        ],
      });

    if (!policy) {
      throw new Error(
        "Leave policy not found"
      );
    }

    // ===================================================
    // 5. VALIDATE HALF DAY
    // ===================================================

    if (
      data.dayType !== "FULL_DAY" &&
      !policy.halfDayAllowed
    ) {
      throw new Error(
        `${policy.name} does not allow half-day leave`
      );
    }

    // ===================================================
    // 6. HALF DAY DATE VALIDATION
    // ===================================================

    if (
      data.dayType !== "FULL_DAY" &&
      data.startDate !== data.endDate
    ) {
      throw new Error(
        "Half-day leave can only be applied for one date"
      );
    }

    // ===================================================
    // 7. MATERNITY VALIDATION
    // ===================================================

    if (
      data.leaveType === "MATERNITY"
    ) {

      if (!data.childNumber) {
        throw new Error(
          "Child number is required for maternity leave"
        );
      }

      if (
        data.childNumber < 1
      ) {
        throw new Error(
          "Invalid child number"
        );
      }

      // -----------------------------------------------
      // SERVICE ELIGIBILITY
      // -----------------------------------------------

      if (!employee.joiningDate) {
        throw new Error("Employee joining date is missing");
      }

      const serviceDays =
        Math.floor(
          (
            startDate.getTime() -
            employee.joiningDate.getTime()
          ) /
          (1000 * 60 * 60 * 24)
        );

      if (
        policy.minimumServiceDays &&
        serviceDays <
          policy.minimumServiceDays
      ) {
        throw new Error(
          `Minimum ${policy.minimumServiceDays} days of service is required for maternity leave`
        );
      }
    }

    // ===================================================
    // 8. BEREAVEMENT VALIDATION
    // ===================================================

    if (
      data.leaveType ===
      "BEREAVEMENT"
    ) {

      if (!data.relationship) {
        throw new Error(
          "Relationship is required for bereavement leave"
        );
      }

      const relationship =
        data.relationship.toUpperCase();

      const allowed =
        policy.eligibleRelationships?.includes(
          relationship
        );

      if (!allowed) {
        throw new Error(
          "This relationship is not covered under bereavement leave policy"
        );
      }
    }

    // ===================================================
    // 9. CHECK OVERLAPPING LEAVE
    // ===================================================

    const overlappingLeave =
      await LeaveRequest.findOne({
        employeeId,

        status: {
          $in: [
            "PENDING",
            "APPROVED",
          ],
        },

        startDate: {
          $lte: endDate,
        },

        endDate: {
          $gte: startDate,
        },
      });

    if (overlappingLeave) {
      throw new Error(
        "You already have a pending or approved leave for this date range"
      );
    }

    // ===================================================
    // 10. CALCULATE LEAVE
    // ===================================================

    const calculation =
      await this.calculationService.calculateLeave(
        employeeId,
        startDate,
        endDate
      );

    // ===================================================
    // 11. CALCULATE CHARGEABLE DAYS
    // ===================================================

    let chargeableDays =
      calculation.chargeableDays;

    // Half day
    if (
      data.dayType !== "FULL_DAY"
    ) {
      chargeableDays = 0.5;
    }

    if (chargeableDays <= 0) {
      throw new Error(
        "No chargeable leave days found for the selected dates"
      );
    }

    // ===================================================
    // 12. GET CURRENT LEAVE YEAR
    // ===================================================

    const leaveYear =
      this.calculationService
        ? this.getLeaveYear(startDate)
        : "";

    // ===================================================
    // 13. GET BALANCE
    // ===================================================

    const balance =
      await LeaveBalance.findOne({
        employeeId,

        leaveType: data.leaveType,

        leaveYear,
      });

    // ===================================================
    // 14. SPECIAL LEAVE TYPES
    // ===================================================

    if (
      data.leaveType === "EL" ||
      data.leaveType === "CSL"
    ) {

      if (!balance) {
        throw new Error(
          "Leave balance not initialized"
        );
      }

      const usableBalance =
        balance.available -
        balance.pending;

      if (
        usableBalance <
        chargeableDays
      ) {
        throw new Error(
          `Insufficient ${data.leaveType} balance. Available: ${usableBalance} days`
        );
      }
    }

    // ===================================================
    // 15. MONGODB TRANSACTION
    // ===================================================

    const { session, transactional } =
      await beginOptionalTransaction();

    try {

      // -----------------------------------------------
      // CREATE REQUEST
      // -----------------------------------------------

      const [leaveRequest] =
        await LeaveRequest.create(
          [
            {
              employeeId,

              leaveType:
                data.leaveType,

              startDate,

              endDate,

              dayType:
                data.dayType,

              totalCalendarDays:
                calculation.totalCalendarDays,

              workingLeaveDays:
                calculation.workingLeaveDays,

              sandwichDays:
                calculation.sandwichDays,

              chargeableDays,

              sandwichDates:
                calculation.sandwichDates,

              weekOffDates:
                calculation.weekOffDates,

              holidayDates:
                calculation.holidayDates,

              reason:
                data.reason.trim(),

              attachment:
                data.attachment,

              status: "PENDING",

              appliedAt: new Date(),

              relationship:
                data.relationship,

              childNumber:
                data.childNumber,
            },
          ],
          { session }
        );

      // -----------------------------------------------
      // RESERVE BALANCE
      // -----------------------------------------------

      if (
        balance &&
        (
          data.leaveType === "EL" ||
          data.leaveType === "CSL"
        )
      ) {

        const updatedBalance =
          await LeaveBalance.findOneAndUpdate(
            {
              _id: balance._id,

              available: {
                $gte: chargeableDays,
              },
            },

            {
              $inc: {
                pending:
                  chargeableDays,
              },
            },

            {
              new: true,
              session,
            }
          );

        if (!updatedBalance) {
          throw new Error(
            "Leave balance changed. Please try again."
          );
        }
      }

      await commitOptionalTransaction(session, transactional);

      return leaveRequest;

    } catch (error) {

      await abortOptionalTransaction(session, transactional);

      throw error;

    } finally {

      await session.endSession();
    }
  }

  // =====================================================
  // LEAVE YEAR
  // =====================================================

  private getLeaveYear(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      date.getMonth() + 1;

    if (month >= 4) {
      return `${year}-${String(
        year + 1
      ).slice(-2)}`;
    }

    return `${year - 1}-${String(
      year
    ).slice(-2)}`;
  }
  // =====================================================
// APPROVE LEAVE
// =====================================================

async approveLeave(
  leaveRequestId: string,
  approverId: string,
  hrRemarks?: string
) {
  const { session, transactional } =
    await beginOptionalTransaction();

  try {

    // ===============================================
    // 1. FIND PENDING REQUEST
    // ===============================================

    const leaveRequest =
      await LeaveRequest.findOne({
        _id: leaveRequestId,
        status: "PENDING",
      }).session(session);

    if (!leaveRequest) {
      throw new Error(
        "Pending leave request not found"
      );
    }

    // ===============================================
    // 2. FIND BALANCE
    // ===============================================

    const leaveYear =
      this.getLeaveYear(
        leaveRequest.startDate
      );

    const balance =
      await LeaveBalance.findOne({
        employeeId:
          leaveRequest.employeeId,

        leaveType:
          leaveRequest.leaveType,

        leaveYear,
      }).session(session);

    // EL / CSL require balance
    if (
      leaveRequest.leaveType === "EL" ||
      leaveRequest.leaveType === "CSL"
    ) {
      if (!balance) {
        throw new Error(
          "Leave balance not found"
        );
      }

      // =========================================
      // CHECK PENDING BALANCE
      // =========================================

      if (
        balance.pending <
        leaveRequest.chargeableDays
      ) {
        throw new Error(
          "Pending leave balance is inconsistent"
        );
      }

      // =========================================
      // MOVE PENDING → USED
      // =========================================

      balance.pending -=
        leaveRequest.chargeableDays;

      balance.used +=
        leaveRequest.chargeableDays;

      balance.available -=
        leaveRequest.chargeableDays;

      if (balance.available < 0) {
        throw new Error(
          "Leave balance cannot become negative"
        );
      }

      await balance.save({
        session,
      });
    }

    // ===============================================
    // 3. UPDATE REQUEST
    // ===============================================

    leaveRequest.status =
      "APPROVED";

    leaveRequest.approvedBy =
      new mongoose.Types.ObjectId(
        approverId
      );

    leaveRequest.approvedAt =
      new Date();

    if (hrRemarks) {
      leaveRequest.hrRemarks =
        hrRemarks.trim();
    }

    await leaveRequest.save({
      session,
    });

    // ===============================================
    // 4. COMMIT
    // ===============================================

    await commitOptionalTransaction(session, transactional);

    return leaveRequest;

  } catch (error) {

    await abortOptionalTransaction(session, transactional);

    throw error;

  } finally {

    await session.endSession();
  }
}
// =====================================================
// REJECT LEAVE
// =====================================================

async rejectLeave(
  leaveRequestId: string,
  approverId: string,
  rejectionReason: string
) {
  if (!rejectionReason?.trim()) {
    throw new Error(
      "Rejection reason is required"
    );
  }

  const { session, transactional } =
    await beginOptionalTransaction();

  try {

    // ===============================================
    // 1. FIND PENDING REQUEST
    // ===============================================

    const leaveRequest =
      await LeaveRequest.findOne({
        _id: leaveRequestId,
        status: "PENDING",
      }).session(session);

    if (!leaveRequest) {
      throw new Error(
        "Pending leave request not found"
      );
    }

    // ===============================================
    // 2. FIND BALANCE
    // ===============================================

    const leaveYear =
      this.getLeaveYear(
        leaveRequest.startDate
      );

    const balance =
      await LeaveBalance.findOne({
        employeeId:
          leaveRequest.employeeId,

        leaveType:
          leaveRequest.leaveType,

        leaveYear,
      }).session(session);

    // ===============================================
    // 3. RELEASE PENDING BALANCE
    // ===============================================

    if (
      leaveRequest.leaveType === "EL" ||
      leaveRequest.leaveType === "CSL"
    ) {
      if (!balance) {
        throw new Error(
          "Leave balance not found"
        );
      }

      if (
        balance.pending <
        leaveRequest.chargeableDays
      ) {
        throw new Error(
          "Pending leave balance is inconsistent"
        );
      }

      balance.pending -=
        leaveRequest.chargeableDays;

      await balance.save({
        session,
      });
    }

    // ===============================================
    // 4. UPDATE REQUEST
    // ===============================================

    leaveRequest.status =
      "REJECTED";

    leaveRequest.rejectedBy =
      new mongoose.Types.ObjectId(
        approverId
      );

    leaveRequest.rejectedAt =
      new Date();

    leaveRequest.hrRemarks =
      rejectionReason.trim();

    await leaveRequest.save({
      session,
    });

    // ===============================================
    // 5. COMMIT
    // ===============================================

    await commitOptionalTransaction(session, transactional);

    return leaveRequest;

  } catch (error) {

    await abortOptionalTransaction(session, transactional);

    throw error;

  } finally {

    await session.endSession();
  }
}

  async getMyLeaves(employeeId: string) {
    return LeaveRequest.find({ employeeId })
      .populate(
        "employeeId",
        "fullName employeeCode department designation"
      )
      .sort({ appliedAt: -1 });
  }

  async getLeaves(status?: string, managerId?: string) {
    const filter: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (managerId) {
      const team = await User.find({ managerId }).select("_id");
      filter.employeeId = { $in: team.map((item) => item._id) };
    }

    return LeaveRequest.find(filter)
      .populate(
        "employeeId",
        "fullName employeeCode department designation"
      )
      .sort({ appliedAt: -1 });
  }

  async cancelLeave(
    leaveRequestId: string,
    employeeId: string
  ) {
    const { session, transactional } = await beginOptionalTransaction();

    try {
      const leaveRequest = await LeaveRequest.findOne({
        _id: leaveRequestId,
        employeeId,
        status: "PENDING",
      }).session(session);

      if (!leaveRequest) {
        throw new Error("Pending leave request not found");
      }

      const leaveYear = this.getLeaveYear(leaveRequest.startDate);

      if (
        leaveRequest.leaveType === "EL" ||
        leaveRequest.leaveType === "CSL"
      ) {
        const balance = await LeaveBalance.findOne({
          employeeId,
          leaveType: leaveRequest.leaveType,
          leaveYear,
        }).session(session);

        if (!balance) {
          throw new Error("Leave balance not found");
        }

        balance.pending = Math.max(
          0,
          balance.pending - leaveRequest.chargeableDays
        );

        await balance.save({ session });
      }

      leaveRequest.status = "CANCELLED";
      leaveRequest.cancelledAt = new Date();
      await leaveRequest.save({ session });
      await commitOptionalTransaction(session, transactional);

      return leaveRequest;
    } catch (error) {
      await abortOptionalTransaction(session, transactional);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}