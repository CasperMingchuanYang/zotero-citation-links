// Copy Zotero Link — APA/Pandoc Citations, Notes, and PDF Annotations
// Based on the original script by windingwind and garth74, with
// annotation-related improvements inspired by FeralFlora.
// Original: https://github.com/windingwind/zotero-actions-tags/discussions/115
// Adapted and refined with assistance from OpenAI GPT-6.
//
// FEATURES
// - APA-style author-year labels (default), or Pandoc citation keys
// - Zotero notes use their note titles; Better Notes deep links supported
// - PDF annotations copy highlight + italic personal note + page citation
// - Markdown, HTML, or plain Zotero links
//
// USAGE
// Paste into a Zotero Actions & Tags Script action; assign a shortcut.
// For individual PDF annotations, run the action on the annotation item
// in the PDF reader's annotation sidebar.
//
// LIMITATIONS
// The direct APA mode handles common author counts, but is not a full
// APA 7 / CSL formatter (e.g. same-year a/b disambiguation is not handled).
// Pandoc citation rendering inside Markdown hyperlinks depends on the
// receiving application's plugin support.

// ==================================================
// EDIT THESE SETTINGS
// ==================================================
let linkTextField = "citationKey";
let linkType = "md";             // "md", "html", or "plain"
let useColl = true;              // Collection-aware selection links
let useNoteLink = true;          // Better Notes zotero://note links
let linkAction = "auto";         // "auto", "select", or "open-pdf"
let citationDisplayMode = "apa"; // "apa" (default) or "pandoc"
// END OF EDITABLE SETTINGS

// Run only once for a multi-item action invocation.
if (item) return;
const selected = items?.[0] || null;
if (!selected && !collection) {
  return "[Copy Zotero Link] No item selected";
}

function getTopItem(it) {
  return Zotero.Items.getTopLevel([it])?.[0] || it;
}

// Basic APA-style author-year text, without enclosing parentheses.
function getAPALabel(ref) {
  const all = ref.getCreators?.() || [];
  const byRole = (roles) => all.filter((c) => {
    const role = c.creatorType ||
      (c.creatorTypeID != null
        ? Zotero.CreatorTypes.getName(c.creatorTypeID)
        : "");
    return roles.includes(role);
  });
  const authors = byRole(["author", "bookAuthor"]);
  const editors = byRole(["editor"]);
  const chosen = authors.length ? authors : (editors.length ? editors : all);
  const names = chosen
    .map((c) => (c.lastName || c.name || "").trim())
    .filter(Boolean);
  const date = String(ref.getField("date") || "");
  const year = date.match(/(?:18|19|20|21)\d{2}/)?.[0] || "n.d.";

  if (names.length === 1) return `${names[0]}, ${year}`;
  if (names.length === 2) return `${names[0]} & ${names[1]}, ${year}`;
  if (names.length >= 3) return `${names[0]} et al., ${year}`;
  return `${ref.getField("title") || "Untitled"}, ${year}`;
}

function getCitationText(ref, pageLabel = "") {
  const key = String(ref.getField(linkTextField) || "").trim();
  const locator = pageLabel ? `, p. ${pageLabel}` : "";
  if (citationDisplayMode === "pandoc" && key) {
    return `@${key}${locator}`;
  }
  return `${getAPALabel(ref)}${locator}`;
}

function escapeMarkdownLabel(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

const targetCollection = collection || null;
let mode = targetCollection ? "select" : linkAction;
if (!targetCollection && mode === "auto") {
  mode = (selected.isPDFAttachment() || selected.isAnnotation())
    ? "open-pdf" : "select";
}

let target = selected;
let pageLabel = "";
let uriParams = "";

if (selected?.isAnnotation()) {
  target = selected.parentItem;
  let pageIndex = 1;
  try {
    pageIndex = JSON.parse(selected.annotationPosition).pageIndex + 1;
  } catch (e) {
    Zotero.warn(e);
  }
  pageLabel = String(selected.annotationPageLabel || pageIndex);
  if (mode === "open-pdf") {
    uriParams = `?page=${pageIndex}&annotation=${selected.key}`;
  }
} else if (mode === "open-pdf" && selected?.isRegularItem()) {
  const attachments = await selected.getBestAttachments();
  target = attachments.find((att) => att.isPDFAttachment());
  if (!target) {
    target = selected;
    mode = "select";
  }
} else if (mode === "open-pdf" && selected?.isNote()) {
  mode = "select";
}

if (!target && !targetCollection) {
  return "[Copy Zotero Link] Invalid target";
}

const source = targetCollection || selected;
const lib = source.library.libraryType === "user"
  ? "library"
  : `groups/${Zotero.Libraries.get(source.libraryID).groupID}`;
let uri;

if (targetCollection) {
  uri = `zotero://select/${lib}/collections/${targetCollection.key}`;
} else if (mode === "open-pdf") {
  uri = `zotero://open-pdf/${lib}/items/${target.key}${uriParams}`;
} else {
  let collectionPart = "";
  if (useColl) {
    const pane = Zotero.getActiveZoteroPane();
    const coll = pane.getSelectedCollection?.() ||
      pane.getSelectedCollections?.()?.[0];
    if (coll) collectionPart = `collections/${coll.key}/`;
  }
  uri = `zotero://select/${lib}/${collectionPart}items/${target.key}`;
}

if (useNoteLink && selected?.isNote() && Zotero.BetterNotes) {
  uri = Zotero.BetterNotes.api.convert.note2link(selected);
}

let citation = "";
let noteOrCollectionTitle = "";
let highlighted = "";
let comment = "";

if (targetCollection) {
  noteOrCollectionTitle = targetCollection.name;
} else if (selected.isNote()) {
  noteOrCollectionTitle = selected.getNoteTitle() || "Untitled Note";
} else if (selected.isAnnotation()) {
  citation = getCitationText(getTopItem(selected), pageLabel);
  highlighted = String(selected.annotationText || "").trim();
  comment = String(selected.annotationComment || "").trim();
} else {
  citation = getCitationText(getTopItem(selected));
}

const clipboard = new Zotero.ActionsTags.api.utils.ClipboardHelper();
if (linkType === "plain") {
  clipboard.addText(uri, "text/unicode");
} else if (linkType === "html") {
  const htmlText = noteOrCollectionTitle || citation;
  const html = `<a href="${uri}">${htmlText}</a>`;
  clipboard.addText(html, "text/unicode");
  clipboard.addText(html, "text/html");
} else if (linkType === "md") {
  let output;
  if (targetCollection || selected.isNote()) {
    output = `[${escapeMarkdownLabel(noteOrCollectionTitle)}](${uri})`;
  } else {
    const citationLink = `[${escapeMarkdownLabel(citation)}](${uri})`;
    if (selected.isAnnotation()) {
      const parts = [];
      if (highlighted) {
        parts.push(highlighted.replace(/\s*\r?\n\s*/g, " "));
      }
      if (comment) {
        const oneLineComment = comment
          .replace(/\s*\r?\n\s*/g, " ")
          .replace(/\*/g, "\\*");
        // Change "注释：" to "Note: " if you prefer English.
        parts.push(`*注释：${oneLineComment}*`);
      }
      parts.push(citationLink);
      output = parts.join(" ");
    } else {
      output = citationLink;
    }
  }
  clipboard.addText(output, "text/unicode");
} else {
  return `[Copy Zotero Link] Unsupported linkType: ${linkType}`;
}

clipboard.copy();
return `[Copy Zotero Link] Copied ${uri}`;
  
