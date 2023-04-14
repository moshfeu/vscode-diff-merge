## 🌅🌅 This extension is (almost) not needed anymore 🌅🌅

Since vscode [has 3 way merge built-in](https://code.visualstudio.com/updates/v1_69#_3-way-merge-editor), and even a better one, this extension is no longer needed.

I keep the extension and the source code for education and refrences only.


[![Build Status](https://dev.azure.com/moshfeu-vscode/DiffMergeExtension/_apis/build/status/moshfeu.vscode-diff-merge?branchName=master)](https://dev.azure.com/moshfeu-vscode/DiffMergeExtension/_build/latest?definitionId=1&branchName=master)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-yellow.svg?style=flat)](https://github.com/Coding-Coach/find-a-mentor/issues)
[![The MIT License](https://flat.badgen.net/badge/license/MIT/orange)](http://opensource.org/licenses/MIT)
[![GitHub](https://flat.badgen.net/github/release/moshfeu/vscode-diff-merge)](https://github.com/moshfeu/vscode-diff-merge/releases)
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/i/moshfeu.diff-merge.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=moshfeu.diff-merge)
[![Follow me on Twitter](https://img.shields.io/twitter/follow/moshfeu.svg?style=social)](https://twitter.com/moshfeu)

# Diff & Merge!

Show diffs and allow mergeing from left side to right side.

✋ **This extension is maintained on my free time. I'm only fixing / developing features requested by the community.**

🧙‍♂️ Notice that I (and seems that many others) couldn't find an easy way to implement such feature. Therefor, the user experience may not be perfect. The colors, fonts, icons, shortcuts and other UI elements may not be the same as vscode's.

<img width="1061" alt="Screen Shot of the extension" src="https://user-images.githubusercontent.com/3723951/70169375-5b116a80-16d3-11ea-800e-99fd941a1bd8.png">

👂**I would love to hear your feedback to improve this tool**

Found a bug? Have an extra ordinary idea? Please create an [issue](https://github.com/moshfeu/vscode-diff-merge/issues/new)


## Features

### 1. Diff and merge - file against file

<img width="463" alt="explorer - context" src="https://user-images.githubusercontent.com/3723951/69405996-b4f45680-0d09-11ea-9b9f-f24f9e9c69a5.png">

Or

### File against selected file (#40)

<details>
  <img width="463" src="https://user-images.githubusercontent.com/3723951/116193146-92087600-a737-11eb-8f6f-de6dca038b8f.gif" />
</details>

**How to use?**

1. Right click on a file <sup>[1]</sup> in _explorer_ panel or on an editor tab
2. Click `[Diff & Merge] Select file to compare`
3. Right click on another file or an editor tab
4. Click `[Diff & Merge] Compare file with selected file`

### 2. Diff and merge - file against clipboard (#25)

<details>
  <img width="463" src="https://user-images.githubusercontent.com/3723951/98452048-7cd16800-2154-11eb-9a3c-cdc8fe73aa90.gif" />
</details>

**How to use?**

1. Right click on a file <sup>[1]</sup> in _explorer_ panel
2. Click `[Diff & Merge] Choose a file to merge`
3. Choose a file <sup>[1]</sup> to compare

### 3. Diff and merge - git - file against older version

<img width="340" alt="source control - context" src="https://user-images.githubusercontent.com/3723951/69405995-b4f45680-0d09-11ea-837c-4a8925df3556.png">

**How to use?**

1. Right click on a file <sup>[1]</sup> in the source control panel under **Changes** (staged files are not editable anyway)
1. Click on `[Diff & Merge] Open Changes`

### 4. Diff and merge - svn - changes (tested with the [svg extension](https://marketplace.visualstudio.com/items?itemName=johnstoncode.svn-scm))

<img width="300" alt="source control - svn" src="https://user-images.githubusercontent.com/3723951/93455884-9ccb7480-f8e5-11ea-8a43-e8c924c4e4cd.png">

1. Right click on a file <sup>[1]</sup> in the source control panel under **Changes** (staged files are not editable anyway)
1. Click on `[Diff & Merge] Open Changes`

### 4. Diff and merge - from scratch

**How to use?**

1. Open commmand palette (<kbd>Command / Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>)
1. Search for `[Diff & Merge] Blank diff view`
2. An empty diff view will opened. Paste a code in both sides and compare

<hr />
<sup>[1]</sup> - Make sure that the file is text based (not images, binaries, pdfs etc.)

## To Do

- [ ] Add save button next to the diff navigator buttons
- [ ] Add "Go to original file" next to the save button
- [ ] Allow to change the "save" key binding
- [ ] Focus the tab when asking to compare a file that already open
- [ ] Add option to ignore files by pattern (?)

## Known issues

- Context menu shows up for non text based files (binary etc.)
- Diff editors theme has different look & feel than current theme ([monaco is not fully competiable with vscode theme](https://github.com/Microsoft/monaco-editor/issues/675#issuecomment-363151951))
- Left editor can be edited (to allow copy/paste for example) but can't saved
- When first comparing, the theme configuration file appearing for a moment - meant to retrive theme variables for the diff view theme
- [API limitation] For single comparing - left editor is editable but can't be saved
- [API limitation] Draft indication is next to the "x" icon but not on top of it
- [API limitation] Save is only with ctrl / cmd + s. There is no API to listen to "Save" event or getting the current save key binding
- [API limitation] File > Save is disabled
- [API limitation] When moving from dark to light theme, opened windows doesn't refreshed

## Development

```
yarn
cd resources/monaco
yarn
cd ../../
yarn webview:watch
```

Hit <kbd>F5</kbd>

To run the diff view directly in the browser

1. `yarn webview:watch`
2. `yarn monaco` (in different terminal)
3. Go to `http://localhost:12345/wrapper.html`

## Credits

<div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>

## Thanks

<table>
  <tr>
    <td><img width="28" src="https://avatars1.githubusercontent.com/u/198677?s=28&v=4" /></td>
    <td><a href="https://github.com/evilrix">@evilrix</a></td>
  </tr>
  <tr>
    <td><img width="28" src="https://avatars1.githubusercontent.com/u/499317?s=28&v=4" /></td>
    <td><a href="https://github.com/bedge">@bedge</a></td>
  </tr>
  <tr>
    <td><img width="28" src="https://avatars1.githubusercontent.com/u/725456?s=28&v=4" /></td>
    <td><a href="@nemchik">@evilrix</a></td>
  </tr>
</table>

I would love to have you in this list :)
