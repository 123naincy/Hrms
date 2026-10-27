"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveBalanceService = void 0;
const LeaveBalance_1 = __importDefault(require("../models/LeaveBalance"));
const LeavePolicy_1 = __importDefault(require("../models/LeavePolicy"));
const User_1 = __importDefault(require("../models/User"));
class LeaveBalanceService {
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
    getLeaveYear(date = new Date()) {
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
    async initializeEmployeeBalances(employeeId, date = new Date()) {
        // ==========================================
        // 1. FIND EMPLOYEE
        // ==========================================
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!employee.isActive) {
            throw new Error("Employee account is inactive");
        }
        // ==========================================
        // 2. GET LEAVE YEAR
        // ==========================================
        const leaveYear = this.getLeaveYear(date);
        // ==========================================
        // 3. GET ACTIVE POLICIES
        // ==========================================
        const policies = await LeavePolicy_1.default.find({
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
            throw new Error("No active leave policy found");
        }
        const balances = [];
        // ==========================================
        // 4. CREATE BALANCE FOR EACH POLICY
        // ==========================================
        for (const policy of policies) {
            let openingBalance = 0;
            let accrued = 0;
            let carryForward = 0;
            // ========================================
            // EARNED LEAVE
            // ========================================
            if (policy.code === "EL") {
                accrued = this.calculateELAccrual(employee.joiningDate ?? undefined, date, policy.monthlyAccrual ?? 0);
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
            const existingBalance = await LeaveBalance_1.default.findOne({
                employeeId,
                leaveType: policy.code,
                leaveYear,
            });
            if (existingBalance) {
                balances.push(existingBalance);
                continue;
            }
            // ========================================
            // CALCULATE AVAILABLE
            // ========================================
            const available = openingBalance +
                carryForward +
                accrued;
            // ========================================
            // CREATE BALANCE
            // ========================================
            const balance = await LeaveBalance_1.default.create({
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
    calculateELAccrual(joiningDate, currentDate, monthlyAccrual) {
        if (!monthlyAccrual || !joiningDate) {
            return 0;
        }
        // ==========================================
        // LEAVE YEAR START
        // ==========================================
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        let leaveYearStart;
        if (currentMonth >= 3) {
            // April or later
            leaveYearStart = new Date(currentYear, 3, 1);
        }
        else {
            // January - March
            leaveYearStart = new Date(currentYear - 1, 3, 1);
        }
        // ==========================================
        // EMPLOYEE JOINING DATE
        // ==========================================
        const employeeJoiningDate = new Date(joiningDate);
        // ==========================================
        // USE LATER DATE
        // ==========================================
        const effectiveStart = employeeJoiningDate > leaveYearStart
            ? employeeJoiningDate
            : leaveYearStart;
        if (effectiveStart > currentDate) {
            return 0;
        }
        // ==========================================
        // CALCULATE MONTHS
        // ==========================================
        let months = (currentDate.getFullYear() -
            effectiveStart.getFullYear()) *
            12 +
            (currentDate.getMonth() -
                effectiveStart.getMonth());
        // Current month counts
        months += 1;
        // ==========================================
        // CALCULATE ACCRUAL
        // ==========================================
        const accrued = months * monthlyAccrual;
        return Number(accrued.toFixed(2));
    }
    async getEmployeeBalances(employeeId, date = new Date()) {
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        const leaveYear = this.getLeaveYear(date);
        const balances = await LeaveBalance_1.default.find({
            employeeId,
            leaveYear,
        }).sort({
            leaveType: 1,
        });
        return balances;
    }
}
exports.LeaveBalanceService = LeaveBalanceService;
