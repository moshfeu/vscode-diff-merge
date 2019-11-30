# Diff & Merge - Alpha version! Not ready for use yet.

Show diffs and merge from left side to right side.

✋ **This extension is in very early stage of development. Use on your own risk**

<img width="1381" alt="Diff View" src="https://user-images.githubusercontent.com/3723951/69850196-64d83f80-1287-11ea-9b1b-263c897e9344.png">


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

## Change log

#### 0.0.3

- Add diff navigator buttons for navigation between diffs


## To Do

- [x] Show not supported message for not supported files
- [x] Dark mode
- [x] Add diff navigator buttons for navigation between diffs
- [ ] Add save button next to the diff navigator buttons
- [ ] Add "Go to original file" next to the save button
- [ ] Allow to change the "save" key binding
- [ ] Focus the tab when asking to compare a file that already open
- [ ] Add option to ignore files by pattern (?)
- [ ] Add more themes and try to match vscode current theme with the extension's editor theme

## Known issues

- ~~Word diffing~~
- ~~Scroll locking (while scrolling, scroll the other editor)~~
- ~~Action buttons are not scolling with the content (large files)~~
- ~~Cmd + z is lost after click on action~~
- ~~File not supported in diff view~~
- Copy from left deleted lines, replace the row with empty row instead of removing it completely
- Diff editors theme has different look & feel than current theme
- Context menu shows up for non text based files (binary etc.)
- [API limitation] For single comparing - left editor is not editable
- [API limitation] Save is only with ctrl / cmd + s. There is no API to listen to "Save" event or getting the current save key binding
- [API limitation] When moving from dark to light theme, opened windows doesn't refreshed

## Credits

<div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a></div>