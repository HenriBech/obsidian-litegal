# Obsidian Lite Gallery

The Lite Gallery plugin for [Obsidian](https://obsidian.md) makes it easy to create carousel image galleries in your notes. This allows you to neatly organize multiple images into your notes while improving readability and usability.

![Lite Gallery Demo](https://raw.githubusercontent.com/jpoles1/obsidian-litegal/955cd5f6f50048b9f8593bf46aa5c477a30976d5/litegaldemo.gif)

## Installation

1.  **Install BRAT**: Add the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) to Obsidian.
2.  **Add Repository**: Go to the BRAT plugin options and add this repository to the "beta plugin list":
    `https://github.com/HenriBech/obsidian-litegal/`
3.  **Enable**: Enable "Obsidian Lite Gallery" in your Community Plugins list.

> **Note**: This is a fork of the original (abandoned) repository, maintained to include new features and fixes.

## Usage

Create a new gallery in your note using the `litegal` codeblock. You can include images using Obsidian wiki-links or direct web URLs.

### referencing Images

**1. Obsidian Wiki-Links**
Use the standard `[[filename]]` wikilinks format. You don't need the full path if the file is unique in your vault.

```
```litegal
[[image1.jpg]]
[[Folder/image2.png]]
```
```

**2. Web Links**
Directly paste `http` or `https` URLs.

```
```litegal
https://images.unsplash.com/photo-1.jpg
https://example.com/chart.png
```
```

**3. Mixed Usage**
You can mix both local files and web links in the same gallery.

```
```
```litegal
[[my-local-chart.png]]
https://images.unsplash.com/photo-2.jpg
[[screenshot.jpg]]
```
```

**4. Advanced Input Options**
You can automatically load images using the following input commands:
*   `-input:note`: Loads all images referenced in the current note (links and embeds).
*   `-input:folder:path/to/folder`: Loads all images in the specified folder.
*   `-input:folder-recursive:path/to/folder`: Loads all images in the specified folder and its subfolders.

```
```litegal
-input:note
-input:folder:Attachments/Vacation
```
```

## Configuration

You can configure the gallery appearance directly inside the codeblock using inline settings. These settings override the global plugin defaults for that specific gallery.

**Syntax:** `-key: value`

### Available Options

| Key | Values | Description |
| :--- | :--- | :--- |
| `preview` | `preview`, `no-preview`, `toggle` | Controls the visibility of the thumbnail strip. |
| `pagination` | `show`, `hide` | Shows or hides the "1 of X" indicator. |
| `preview_aspect` | `square`, `fit-to-height` | Controls the aspect ratio of the thumbnails. |
| `gallery_aspect` | `contain`, `cover`, `fit-to-width`, `fit-to-height`, `stretch` | Controls how the main image fits the container. |
| `height` | `[number]` (e.g. `400`) | Sets the height of the gallery in pixels (ignored if using fit-to-width/height). |

### Example with Configuration

```
```litegal
-preview: toggle
-gallery_aspect: contain
-height: 400
[[DesignMockup.png]]
[[ArchitectureDiagram.png]]
https://placekitten.com/800/600
```
```

## Obsidian Bases Integration

This plugin adds a **Lite Gallery** view type to [Obsidian Bases](https://help.obsidian.md/bases), allowing you to browse image entries with some metadata.

### How to use
1. Open a **Base** in your vault.
2. Click the `+` icon to add a new view.
3. Select **Lite Gallery**.
4. The view will automatically display images found in the files (either the file itself or image links).

---

## Credits

Thanks to [jpoles1](https://github.com/jpoles1) for the original plugin.

