import { assign, setup } from "xstate";

const progressButtonMachine = setup({
  types: {
    context: {} as {
      progress: number;
    },
    events: {} as
      | { type: "click" }
      | { type: "complete" }
      | { type: "setProgress"; progress: number },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7Kq6wEIFcAXQ9AOwDoBLCAGzAGIBjGyxgawG0AGAXURXSxKhSmX4gAHogCMAZi7kAbABYArAA4ATKtXKA7Fy7z1AGhABPRJoCcs8lwPqjXa3sXXp1xQF9vZtJjYsHhEJBSUpAAKGFg49LBghNGBONx8SCDIgsKipOJSCJqa0kqyuppG0nrVunpmloWG5EWqmm4G1pqyXbK+-jFBIcRkVFEDcYzoALbIdIRgaeJZQiJiGQWyiopKitL6W0XWqlymFojyCrKeXFvSihXK932Z48EEwxSw+IyMcRKwhAAhvNyICAGbzVAACmkxy4AEp6AFYm9QiMvj9UrwltlVnl1ohdgprDdtDpFOo9EVZPVzlwSlobOpXK1ZGybs9kYN3mFyBjfsEAGKAiBgADyRHo-yBIPBkJhCKRryGvP5OGFoolhEWGWWOTWoAKuz09lapJu0k0yketIQ6hK3RsrVcWnU6h0vj8IFI6FF8F1yp5BsyuNy+UQAFpFLao-ZDPGEwm9JzA2jwrQwDiVmGCQhlJpbe7yKp7lxdNJLYoytZrCmUqiPqNkij-QJs8GCkV1M13LovJ5lLI3dGzggLuRlE5WvmScVlHWW0HPt8Ba2Q+38YbEMovORmRpVN1J916bbx5Oy1abFw5wvuWm+Sv1SLxUQs-rN5JEHp8xO7opylUPQqktQtu3NbRlFhO5ZD0WtPSAA */
  context: {
    progress: 0,
  },
  id: "progressButton",
  initial: "idle",

  states: {
    idle: {
      on: { click: "inProgress" },
    },
    inProgress: {
      on: {
        setProgress: {
          actions: assign(({ event }) => {
            return {
              progress: event.progress,
            };
          }),
        },
        complete: "success",
      },
    },
    success: {
      after: {
        1500: "successFadeOut", // Transition to 'successFadeOut' after x ms
      },
    },
    successFadeOut: {
      after: {
        10: "idle", // Transition to 'idle' after x ms
      },
    },
  },
});

export { progressButtonMachine };
