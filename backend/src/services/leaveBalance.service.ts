import LeaveBalance from "../models/LeaveBalance";
import LeavePolicy from "../models/LeavePolicy";
import User from "../models/User";

export class LeaveBalanceService {
  /**
   * Returns the financial leave year.
   *
   * Leave year:
   * 01 April → 31 March
   *
   * Examples:
   * 08-Aug-2026 → 2026-27
   * 20-Feb-2027 → 2026-27
   * 10-Apr-2027 → 2027-28
   */
  getLeaveYear(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= 4) {
      return `${year}-${String(year + 1).slice(-2)}`;
    }

    return `${year - 1}-${String(year).slice(-2)}`;
  }

  /**
   * Initialize leave balances for an employee
   * for the current leave year.
   */
  async initializeEmployeeBalances(
    employeeId: string,
    date: Date = new Date()
  ) {
    // ==========================================
    // 1. FIND EMPLOYEE
    // ==========================================

    const employee = await User.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (!employee.isActive) {
      throw new Error(
        "Employee account is inactive"
      );
    }

    // ==========================================
    // 2. GET LEAVE YEAR
    // ==========================================

    const leaveYear = this.getLeaveYear(date);

    // ==========================================
    // 3. GET ACTIVE POLICIES
    // ==========================================

    const policies = await LeavePolicy.find({
      isActive: true,

      effectiveFrom: {
        $lte: date,
      },

      $or: [
        {
          effectiveTo: {
            $gte: date,
          },
        },
        {
          effectiveTo: null,
        },
      ],
    });

    if (!policies.length) {
      throw new Error(
        "No active leave policy found"
      );
    }

    const balances = [];

    // ==========================================
    // 4. CREATE BALANCE FOR EACH POLICY
    // ==========================================

    if (!employee.joiningDate) {
      employee.joiningDate =
        (employee.get("createdAt") as Date | undefined) || new Date();
      await employee.save();
    }

    const joiningDate = employee.joiningDate;

    for (const policy of policies) {
      let openingBalance = 0;
      let accrued = 0;
      let carryForward = 0;

      // ========================================
      // EARNED LEAVE
      // ========================================

      if (policy.code === "EL") {
        accrued = this.calculateELAccrual(
          joiningDate,
          date,
          policy.monthlyAccrual ?? 0
        );
      }

      // ========================================
      // CASUAL & SICK LEAVE
      // ========================================

      if (policy.code === "CSL") {
        accrued =
          policy.annualEntitlement ?? 0;
      }

      // ========================================
      // MATERNITY
      // ========================================

      if (policy.code === "MATERNITY") {
        accrued = 0;
      }

      // ========================================
      // BEREAVEMENT
      // ========================================

      if (policy.code === "BEREAVEMENT") {
        accrued = 0;
      }

      // ========================================
      // CHECK EXISTING BALANCE
      // ========================================

      const available =
        openingBalance +
        carryForward +
        accrued;

      const existingBalance =
        await LeaveBalance.findOne({
          employeeId,
          leaveType: policy.code,
          leaveYear,
        });

      if (existingBalance) {
        if (
          existingBalance.used === 0 &&
          existingBalance.pending === 0 &&
          (existingBalance.accrued !== accrued ||
            existingBalance.available !== available)
        ) {
          existingBalance.openingBalance = openingBalance;
          existingBalance.accrued = accrued;
          existingBalance.carryForward = carryForward;
          existingBalance.available = available;
          await existingBalance.save();
        }

        balances.push(existingBalance);
        continue;
      }

      // ========================================
      // CREATE BALANCE
      // ========================================

      const balance =
        await LeaveBalance.create({
          employeeId,

          leaveType: policy.code,

          leaveYear,

          openingBalance,

          accrued,

          carryForward,

          used: 0,

          pending: 0,

          available,
        });

      balances.push(balance);
    }

    return balances;
  }

  /**
   * Calculate Earned Leave accrual.
   *
   * EL policy:
   * 1.5 days per month.
   */
  calculateELAccrual(
    joiningDate: Date | undefined,
    currentDate: Date,
    monthlyAccrual: number
  ): number {
    if (!monthlyAccrual || !joiningDate) {
      return 0;
    }

    // ==========================================
    // LEAVE YEAR START
    // ==========================================

    const currentYear =
      currentDate.getFullYear();

    const currentMonth =
      currentDate.getMonth();

    let leaveYearStart: Date;

    if (currentMonth >= 3) {
      // April or later
      leaveYearStart = new Date(
        currentYear,
        3,
        1
      );
    } else {
      // January - March
      leaveYearStart = new Date(
        currentYear - 1,
        3,
        1
      );
    }

    // ==========================================
    // EMPLOYEE JOINING DATE
    // ==========================================

    const employeeJoiningDate =
      new Date(joiningDate);

    // ==========================================
    // USE LATER DATE
    // ==========================================

    const effectiveStart =
      employeeJoiningDate > leaveYearStart
        ? employeeJoiningDate
        : leaveYearStart;

    if (effectiveStart > currentDate) {
      return 0;
    }

    // ==========================================
    // CALCULATE MONTHS
    // ==========================================

    let months =
      (currentDate.getFullYear() -
        effectiveStart.getFullYear()) *
        12 +
      (currentDate.getMonth() -
        effectiveStart.getMonth());

    // Current month counts
    months += 1;

    // ==========================================
    // CALCULATE ACCRUAL
    // ==========================================

    const accrued =
      months * monthlyAccrual;

    return Number(
      accrued.toFixed(2)
    );
  }
  async getEmployeeBalances(
  employeeId: string,
  date: Date = new Date()
) {
  const employee = await User.findById(
    employeeId
  );

  if (!employee) {
    throw new Error("Employee not found");
  }

  const leaveYear =
    this.getLeaveYear(date);

  const balances =
    await LeaveBalance.find({
      employeeId,
      leaveYear,
    }).sort({
      leaveType: 1,
    });

  return balances;
}
}