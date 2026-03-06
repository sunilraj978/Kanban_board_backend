const service = require("./taskService");
const { validateTask } = require("./validation");

let users = 0;

function socketHandler(io) {

  io.on("connection", async (socket) => {

    console.log("User connected");

    users++;
    io.emit("presence", users);

    try {

      const tasks = await service.getTasks();
      socket.emit("init", tasks);

    } catch (err) {

      socket.emit("error", err.message);

    }

    // CREATE TASK
    socket.on("createTask", async (data, callback) => {

      try {

        validateTask(data.title, data.description, data.column);

        const task = await service.createTask(
          data.title,
          data.description,
          data.column
        );

        io.emit("taskCreated", task);

        if (callback) callback({ success: true });

      } catch (err) {

        socket.emit("error", err.message);

        if (callback) callback({ success: false });

      }

    });

    // UPDATE TASK
    socket.on("updateTask", async (data, callback) => {

      try {

        await service.updateTask(
          data.id,
          data.title,
          data.description,
          data.version
        );

        io.emit("taskUpdated", data);

        if (callback) callback({ success: true });

      } catch (err) {

        socket.emit("conflict", err.message);

        if (callback) callback({ success: false });

      }

    });

    // MOVE TASK
    socket.on("moveTask", async (data, callback) => {

      try {

        const tasks = await service.getTasks();

        const columnTasks = tasks
          .filter(t => t.column_type === data.column && t.id !== data.id)
          .sort((a, b) => a.position - b.position);

        const index = data.index ?? columnTasks.length;

        const prev = columnTasks[index - 1];
        const next = columnTasks[index];

        let newPos;

        if (!prev && !next) newPos = 1;
        else if (!prev) newPos = next.position / 2;
        else if (!next) newPos = prev.position + 1;
        else newPos = (prev.position + next.position) / 2;

        await service.moveTask(data.id, data.column, newPos);

        io.emit("taskMoved", {
          id: data.id,
          column: data.column,
          position: newPos
        });

        if (callback) callback({ success: true });

      } catch (err) {

        socket.emit("error", err.message);

        if (callback) callback({ success: false });

      }

    });

    // DELETE TASK
    socket.on("deleteTask", async (id, callback) => {

      try {

        await service.deleteTask(id);

        io.emit("taskDeleted", id);

        if (callback) callback({ success: true });

      } catch (err) {

        socket.emit("error", err.message);

        if (callback) callback({ success: false });

      }

    });

    socket.on("disconnect", () => {

      console.log("User disconnected");

      users--;
      io.emit("presence", users);

    });

  });

}

module.exports = socketHandler;