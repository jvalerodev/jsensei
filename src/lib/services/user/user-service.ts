import { getDatabase } from "@/lib/database/server";

export class UserService {
  public static async getById(id: string) {
    const db = await getDatabase();
    return await db.users.findById(id);
  }
}
