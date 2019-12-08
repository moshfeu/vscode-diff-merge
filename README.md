# Diff & Merge - Alpha version!

Show diffs and allow to merge from left side to right side.

✋ **This extension is in very early stage of development. Use on your own risk**

<img width="1061" alt="Screen Shot 2019-12-04 at 20 18 22" src="https://user-images.githubusercontent.com/3723951/70169375-5b116a80-16d3-11ea-800e-99fd941a1bd8.png">

👂**I would love to hear your feedback to improve this tool**

Found a bug? Have an extra ordinary idea? Please create an [issue](https://github.com/moshfeu/vscode-diff-merge/issues/new)

🧙‍♂️Notice that I (and seems that many others) couldn't find an easy way to implement such feature. Therefor, the user experience may not be perfect. The colors, fonts, icons, shortcuts and cetera may not be the same as vscode's. I'll do our best to match the experienc though.

## Features

### 1. Diff and merge - file against file

<img width="463" alt="explorer - context" src="https://user-images.githubusercontent.com/3723951/69405996-b4f45680-0d09-11ea-9b9f-f24f9e9c69a5.png">

**How to use?**

1. Right click on a file <sup>[1]</sup> in _explorer_ panel
1. Click on `[Diff & Merge] Choose a file to merge`
1. Choose a file <sup>[1]</sup> to compare
<hr />

### 2. Diff and merge - git - file against older version

<img width="340" alt="source control - context" src="https://user-images.githubusercontent.com/3723951/69405995-b4f45680-0d09-11ea-837c-4a8925df3556.png">

**How to use?**

1. Right click on a file <sup>[1]</sup> in the source control panel under **Changes** (staged files are not editable anyway)
1. Click on `[Diff & Merge] Open Changes`

<hr >
<sup>[1]</sup> - Make sure that the file is text based (not images, binaries, pdfs etc.)


### 3. Diff and merge - from scratch

**How to use?**

1. Open commmand palette (<kbd>Command / Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>)
1. Search for `[Diff & Merge] Blank diff view`
1. An empty diff view will opened. Paste a code in both of sides and compare

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
- [API limitation] For single comparing - left editor is not editable
- [API limitation] Draft indication is next to the "x" icon but not on top of it
- [API limitation] Save is only with ctrl / cmd + s. There is no API to listen to "Save" event or getting the current save key binding
- [API limitation] File > Save is disabled
- [API limitation] When moving from dark to light theme, opened windows doesn't refreshed

## Development

1. `yarn`
1. `yarn webview:watch`

Hit <kbd>F5</kbd>

To run the diff view directly in the browser

1. `yarn webview:watch`
1. `yarn monaco` (in different terminal)
1. Go to `http://localhost:12345/wrapper.html`

## Credits

<div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div>