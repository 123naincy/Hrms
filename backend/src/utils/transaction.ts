import mongoose, { ClientSession } from "mongoose";

let supportsTransactions: boolean | null = null;

export async function mongoSupportsTransactions() {
  if (supportsTransactions !== null) {
    return supportsTransactions;
  }

  try {
    const db = mongoose.connection.db;

    if (!db) {
      supportsTransactions = false;
      return false;
    }

    const hello = await db.admin().command({ hello: 1 });
    supportsTransactions =
      Boolean(hello?.setName) || hello?.msg === "isdbgrid";
  } catch {
    supportsTransactions = false;
  }

  return supportsTransactions;
}

export async function beginOptionalTransaction(): Promise<{
  session: ClientSession;
  transactional: boolean;
}> {
  const session = await mongoose.startSession();
  const transactional = await mongoSupportsTransactions();

  if (transactional) {
    session.startTransaction();
  }

  return { session, transactional };
}

export async function commitOptionalTransaction(
  session: ClientSession,
  transactional: boolean
) {
  if (transactional) {
    await session.commitTransaction();
  }
}

export async function abortOptionalTransaction(
  session: ClientSession,
  transactional: boolean
) {
  if (transactional && session.inTransaction()) {
    await session.abortTransaction();
  }
}
