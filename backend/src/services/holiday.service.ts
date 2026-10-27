import Holiday from "../models/Holiday";

export class HolidayService {
  async list() {
    return Holiday.find().sort({ date: 1 });
  }

  async create(data: { name: string; date: string }) {
    const date = new Date(data.date);

    if (!data.name?.trim()) {
      throw new Error("Holiday name is required");
    }

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid holiday date");
    }

    return Holiday.create({
      name: data.name.trim(),
      date,
      isActive: true,
    });
  }

  async remove(id: string) {
    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      throw new Error("Holiday not found");
    }

    return holiday;
  }
}
