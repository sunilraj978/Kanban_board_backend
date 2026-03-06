const db = require("./db");
const { v4: uuid } = require("uuid");

async function getTasks() {

  const [rows] = await db.query(
    "SELECT * FROM tasks ORDER BY column_type, position"
  );

  return rows.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    column: t.column_type,
    position: t.position,
    version: t.version
  }));

}

async function createTask(title, description, column) {

  const id = uuid();
  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT IFNULL(MAX(position),0)+1 AS pos FROM tasks WHERE column_type=?",
      [column]
    );

    const position = rows[0].pos;

    await conn.query(
      "INSERT INTO tasks(id, title, description, column_type, position, version) VALUES(?,?,?,?,?,?)",
      [id, title, description, column, position, 1]
    );

    await conn.commit();

    return {
      id,
      title,
      description,
      column,
      position,
      version: 1
    };

  } catch (err) {

    await conn.rollback();
    throw err;

  } finally {

    conn.release();

  }

}

async function updateTask(id, title, description, version) {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const [result] = await conn.query(
      `UPDATE tasks
    SET title=?,description=?,version=version+1,updated_at=NOW()
    WHERE id=? AND version=?`,
      [title, description, id, version]
    );

    if (result.affectedRows === 0)
      throw new Error("Conflict detected");

    await conn.commit();

  } catch (err) {

    await conn.rollback();
    throw err;

  } finally {

    conn.release();

  }

}

async function moveTask(id, column, prevPos, nextPos) {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    console.log(prevPos, nextPos);
    let newPosition;

    if (!prevPos && !nextPos) newPosition = 1;
    else if (!prevPos) newPosition = nextPos / 2;
    else if (!nextPos) newPosition = prevPos + 1;
    else newPosition = (prevPos + nextPos) / 2;

    await conn.query(
      `UPDATE tasks
       SET column_type=?, position=?, version=version+1, updated_at=NOW()
       WHERE id=?`,
      [column, newPosition, id]
    );

    await conn.commit();

  } catch (err) {

    await conn.rollback();
    throw err;

  } finally {

    conn.release();

  }

}

async function deleteTask(id) {

  await db.query(
    "DELETE FROM tasks WHERE id=?",
    [id]
  );

}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask
};