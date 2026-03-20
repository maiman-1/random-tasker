# Random Tasker (Obsidian)

Random Tasker turns your Obsidian workspace into a simple accountability dashboard that shows one random task at a time, lets you mark it as complete or failed, and keeps track of earned rewards and chosen punishments.

## What it does inside Obsidian

- **Bases view UI:** The plugin registers a `Random-Tasker` view via Obsidian's Bases plugin API. Open it from the Quick Switcher (search for _Random-Tasker_) or add it to a workspace pane to see your current task, reward/punishment lists, and task details rendered in-line.
- **Random task selection:** It filters your Bases entries for files under the folder you specify in the settings (default `TaskList/`) and picks one at random each time you click **Next task**, **Complete task**, or **Fail task**.
- **Reward/punishment tracker:** Rewards and punishments are drawn from Markdown files you configure (`Rewards.md` / `Punishments.md` by default). Completing or failing a task rolls a random entry, pushes it into the dashboard table, and persists it so the history survives reloads.
- **Task metadata preview:** The current task file is rendered in the dashboard (via Obsidian’s `MarkdownRenderer`) so you can see properties or content without leaving the view.
- **Quick removal:** Each reward or punishment row has a ❌ button that removes it from the list and immediately saves the updated state.
- **Reusable state storage:** Settings and runtime state (current task, saved rewards/punishments) are persisted via `loadData` / `saveData`, so your dashboard resumes exactly where you left off after a restart.

## Using Random Tasker

1. **Install/enable the plugin**
   - Copy `main.js`, `manifest.json`, and `styles.css` to `<Vault>/.obsidian/plugins/random-tasker/`.
   - Enable the plugin in **Settings → Community plugins**.
   - Open a Bases view, run the **Random-Tasker** view, or use **Ctrl+P → Switch to view** to show the dashboard.

2. **Feed it your tasks**
   - Create a folder (default `TaskList/`) and add Markdown notes representing tasks.
   - Optionally tag them with metadata or write properties—`Random Tasker` will render the content so you can glance at whatever you need.

3. **Define rewards & punishments**
   - Create `Rewards.md` and `Punishments.md` (paths configurable in settings).
   - List one reward/punishment per line; the plugin trims blank lines and uses each line as an option.
   - When you click **Complete task**, the plugin rolls a reward and adds it to the table. Clicking **Fail task** does the same for punishments.

4. **Interact with the dashboard**
   - **Next task** (visible when no task is selected) fetches any random task from the configured folder.
   - **Complete task** selects a random task, rolls a reward, and refreshes the dashboard.
   - **Fail task** also picks a new task and rolls a punishment.
   - Click the ❌ buttons in the reward or punishment tables to clear entries.

5. **Adjust settings**
   - Open the plugin settings tab (via **Settings → Random Tasker**) to:
     - Change the task folder path used for random selection.
     - Point to alternate rewards/punishments files (with or without `.md` extension).
     - Set any future options added to the settings tab.

## Development notes

- Run `npm install` once after cloning the repo.
- Use `npm run dev` while developing to rebuild `main.js` automatically.
- Run `npm run build` before packaging, and never commit generated `main.js`.
- The plugin relies on Bases data, so ensure the Bases plugin is enabled and you have entries grouped by file path.

## Help & inspiration

- Review Obsidian’s [developer documentation](https://docs.obsidian.md) for APIs like `saveData` or `registerBasesView`.
- Copy the structure of `src/settings.ts` and `src/taskState.ts` when introducing new persisted fields.
