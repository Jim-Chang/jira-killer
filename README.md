# JiraKiller

Let the Scrum Master be more happy when using Jira, and reduce the time.
This extension provides the following features:
1. HUD-like, after installing it, it seems to be wearing a steel suit, and the combat effectiveness is doubled
2. With one click, you can create a sub task and fill in the necessary information
3. Optimize workload calculation, can calculate story or sub task
4. Play poker while planning, saving the life of the mouse button when switching browser tabs
## How to develop

Switch to project root directory and enter following commands in console:

```bash
npm install
npm run watch
```

After the library is installed and built, go to Chrome extension settings page and click `Load unpacked` in top left corner. In dialog box, select `dist` folder in project root directory.

## How to compile for production

In project root directory, run following command:

```bash
npm run build
```

The compiled result for production environment can be found in `dist` folder.
