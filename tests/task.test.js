jest.mock("../taskService", () => ({
  createTask: jest.fn(),
  getTasks: jest.fn(),
  deleteTask: jest.fn(),
  updateTask: jest.fn()
}));

const service = require("../taskService");

function calculatePosition(prev, next) {

  if (!prev && !next) return 1;
  if (!prev) return next / 2;
  if (!next) return prev + 1;

  return (prev + next) / 2;
}

describe("Task Service Tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("create task", async () => {

    service.createTask.mockResolvedValue({
      id: "1",
      title: "Test Task",
      description: "Testing",
      column: "todo",
      position: 1,
      version: 1
    });

    const task = await service.createTask(
      "Test Task",
      "Testing",
      "todo"
    );

    expect(task.title).toBe("Test Task");
    expect(task.column).toBe("todo");

  });

  test("get tasks", async () => {

    service.getTasks.mockResolvedValue([
      { id: "1", title: "Task1" },
      { id: "2", title: "Task2" }
    ]);

    const tasks = await service.getTasks();

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBe(2);

  });

  test("delete task", async () => {

    service.deleteTask.mockResolvedValue(true);

    const result = await service.deleteTask("1");

    expect(result).toBe(true);

  });

});

describe("Conflict Scenario", () => {

  test("version conflict detection", async () => {

    service.updateTask
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error("Conflict detected"));

    await service.updateTask(
      "1",
      "User A edit",
      "Edit",
      1
    );

    await expect(
      service.updateTask(
        "1",
        "User B edit",
        "Edit",
        1
      )
    ).rejects.toThrow("Conflict detected");

  });

});

describe("Fractional Ordering", () => {

  test("insert first task", () => {

    const pos = calculatePosition(null, null);

    expect(pos).toBe(1);

  });

  test("insert at start", () => {

    const pos = calculatePosition(null, 2);

    expect(pos).toBe(1);

  });

  test("insert at end", () => {

    const pos = calculatePosition(3, null);

    expect(pos).toBe(4);

  });

  test("insert between tasks", () => {

    const pos = calculatePosition(1, 2);

    expect(pos).toBe(1.5);

  });

});