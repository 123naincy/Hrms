"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const LeavePolicy_1 = __importDefault(require("../models/LeavePolicy"));
dotenv_1.default.config({
    path: ".env",
});
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
}
const leavePolicies = [
    {
        code: "EL",
        name: "Earned Leave",
        description: "Earned Leave (EL) / Privilege Leave (PL). Entitlement is 18 days per year with monthly accrual of 1.5 days.",
        annualEntitlement: 18,
        monthlyAccrual: 1.5,
        maxCarryForward: 30,
        encashmentAllowed: false,
        halfDayAllowed: true,
        requiresMedicalCertificate: false,
        isActive: true,
        effectiveFrom: new Date("2026-04-01T00:00:00.000Z"),
        effectiveTo: new Date("2027-03-31T23:59:59.999Z"),
    },
    {
        code: "CSL",
        name: "Casual & Sick Leave",
        description: "Casual and Sick Leave. Total entitlement is 14 days per year. Half day and full day leave are allowed.",
        annualEntitlement: 14,
        maxCarryForward: 0,
        encashmentAllowed: false,
        halfDayAllowed: true,
        requiresMedicalCertificate: true,
        medicalCertificateAfterDays: 2,
        isActive: true,
        effectiveFrom: new Date("2026-04-01T00:00:00.000Z"),
        effectiveTo: new Date("2027-03-31T23:59:59.999Z"),
    },
    {
        code: "MATERNITY",
        name: "Maternity Leave",
        description: "26 weeks for first two children and 12 weeks for third child onwards.",
        maternityWeeks: 26,
        maternityChildLimit: 2,
        maternityWeeksAfterChildLimit: 12,
        maternityBeforeDeliveryWeeks: 8,
        minimumServiceDays: 80,
        maxCarryForward: 0,
        encashmentAllowed: false,
        halfDayAllowed: false,
        requiresMedicalCertificate: false,
        isActive: true,
        effectiveFrom: new Date("2026-04-01T00:00:00.000Z"),
        effectiveTo: new Date("2027-03-31T23:59:59.999Z"),
    },
    {
        code: "BEREAVEMENT",
        name: "Bereavement Leave",
        description: "Five days of leave on compassionate grounds.",
        bereavementDays: 5,
        eligibleRelationships: [
            "SPOUSE",
            "CHILD",
            "PARENT",
            "SIBLING",
            "PARENT_IN_LAW",
        ],
        maxCarryForward: 0,
        encashmentAllowed: false,
        halfDayAllowed: false,
        requiresMedicalCertificate: false,
        isActive: true,
        effectiveFrom: new Date("2026-04-01T00:00:00.000Z"),
        effectiveTo: new Date("2027-03-31T23:59:59.999Z"),
    },
];
const seedLeavePolicies = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("MongoDB connected");
        for (const policy of leavePolicies) {
            await LeavePolicy_1.default.findOneAndUpdate({
                code: policy.code,
                effectiveFrom: policy.effectiveFrom,
            }, {
                $set: policy,
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            });
            console.log(`✓ ${policy.code} policy seeded`);
        }
        console.log("Leave policies seeded successfully");
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error("Leave policy seed failed:", error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
};
seedLeavePolicies();
