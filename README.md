# JiraKiller

With Jira, you can make the Scrum Master even happier and save time! This extension provides some great features to help you out:

1. HUD-like – just like wearing a steel suit, it will double your combat effectiveness!
2. With one click, you can create a sub task and fill in all the necessary information.
3. Optimize workload calculation – it can calculate stories or sub tasks.
4. Play poker while planning – it will save your mouse button life  without switching browser tabs.

You can get it from the [Chrome Extension Store](https://chrome.google.com/webstore/detail/jira-killer/geaokmikfnlagcafdoncanagegopiphp).

## How to develop

Go to the project root directory and enter the following commands in the terminal:

```bash
npm install
npm run watch
```

Once the library is installed and built, go to the Chrome extension settings page and click `Load unpacked` in the top left corner. In the dialog box, select the `dist` folder in the project root directory.

## How to compile for production

In the project root directory, run the following command:

```bash
npm run build
```

You'll find the compiled version for the production environment in the `dist` folder. Have fun!
