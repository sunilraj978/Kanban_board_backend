jest.mock("../taskService");

const service = require("../taskService");

describe("Conflict scenario", () => {

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