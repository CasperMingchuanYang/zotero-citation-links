# Copy Zotero Links — APA/Pandoc Citations, Notes & Annotations

A customized **Zotero Actions & Tags** script for copying Zotero items, notes, and PDF annotations as convenient links.

I adapted it for collecting literature references, reading notes, and highlights while working in Obsidian and other Markdown-based tools.

## Features

- **Two citation display modes:** `"apa"` (default) generates human-readable author–year labels from Zotero metadata; `"pandoc"` uses the Better BibTeX/Zotero citation key.
- **Direct clickable Zotero links:** References open the corresponding Zotero item, PDF, or PDF annotation.
- **Smart note titles:** Zotero notes use their actual titles, with optional Better Notes deep links.
- **Enhanced PDF annotation copying:** Copy highlighted text, an italicized personal comment (prefixed by `注释：`, meaning "Note:"), and a page-specific citation **on one line**.
- **Flexible output:** Markdown, HTML, or a plain `zotero://` URL.

## Example output

**Regular literature item, APA mode**

```markdown
[Yang et al., 2024](zotero://select/library/items/XXXXXXXX)
```

**Regular literature item, Pandoc mode**

```markdown
[@Yang2024tPBM](zotero://select/library/items/XXXXXXXX)
```

**PDF highlight with a personal comment, APA mode**

```markdown
Highlighted original text *注释：My personal comment* [Yang et al., 2024, p. 5](zotero://open-pdf/library/items/XXXXXXXX?page=5&annotation=YYYYYYYY)
```

**Zotero / Better Notes note**

```markdown
[📝 Detailed paper summary](zotero://note/u/XXXXXXXX/)
```

The examples use placeholder IDs, not actual Zotero items.

## Installation

1. Install [Zotero Actions & Tags](https://github.com/windingwind/zotero-actions-tags) in Zotero.
2. Create a **Script** action, and paste the contents of [`copy-zotero-link.js`](./copy-zotero-link.js) into it.
3. Assign a shortcut or invoke the action from an appropriate item/annotation menu.
4. For individual PDF annotations, run the action **on the annotation item** in the reader's annotation sidebar (not on the parent literature item).
5. Paste the copied output into your note-taking application.

## Configuration

Edit the variables near the beginning of the script:

| Variable | Default | Description |
|---|---|---|
| `citationDisplayMode` | `"apa"` | `"apa"` for direct author–year labels; `"pandoc"` for citation keys |
| `linkTextField` | `"citationKey"` | Citation key field used in Pandoc mode |
| `linkType` | `"md"` | `"md"`, `"html"`, or `"plain"` |
| `useColl` | `true` | Include the selected Zotero collection when making `select` links |
| `useNoteLink` | `true` | Use Better Notes deep links for notes if available |
| `linkAction` | `"auto"` | Automatically open PDF attachments/annotations; select other items |

To switch display modes:

```javascript
let citationDisplayMode = "apa";    // Yang et al., 2024
// or
let citationDisplayMode = "pandoc"; // @Yang2024tPBM
```

In Pandoc mode, automatic citation rendering *inside a Markdown hyperlink* depends on the receiving application's citation plugin and may not work reliably. APA mode works without a separate citation-rendering plugin.

## Limitations

The direct APA mode is a **lightweight author–year label generator**, not a full APA 7 / CSL citation processor. It handles the common patterns for one, two, or three-plus authors, but does not implement complex disambiguation (such as `2024a`/`2024b` or identical author surnames).

For formal manuscripts, use Zotero's citation processor.

This is a community customization of an Actions & Tags script, **not an official Zotero or Actions & Tags release**.

## Credits and acknowledgment

Based on the [original Copy Zotero Link script and community discussion](https://github.com/windingwind/zotero-actions-tags/discussions/115) by **windingwind** and **garth74**, with PDF annotation ideas inspired by **FeralFlora**.

The additional adaptation and integration were assisted by **OpenAI GPT-6**.

## License

Distributed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**, consistent with the license of the upstream Zotero Actions & Tags project. See [LICENSE](./LICENSE).
  
