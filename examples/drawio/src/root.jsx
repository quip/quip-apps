/**
 * Copyright (c) 2018, JGraph Ltd
 * Copyright (c) 2018, Gaudenz Alder
 */
import quip from "quip";

import {
    DiagramRoot,
    CommentEntity
} from "./record.jsx";

// Workaround for sync bug in MS Edge is to disable all editing
/////////////////////////////////////////////
// NOTE: TO ENABLE MSEDGE SET THIS TO true //
// ENABLE THIS IF MS EDGE CAN SAVE CHANGES //
/////////////////////////////////////////////
var isBrowserSupported = window.navigator.userAgent.indexOf("Edge") <= 0;

function isReadOnlyMode()
{
    return !isBrowserSupported;
};

var domain = (location.search.indexOf('&dev_base_href=') >= 0) ? 'test.draw.io' : 'www.draw.io';
var debugOutput = domain == 'test.draw.io';
var drawImage = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjAuMiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyNTAgMjUwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyNTAgMjUwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I2EyYTJhMjt9Cgkuc3Qxe2ZpbGw6IzhlOGU4ZTt9Cgkuc3Qye2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+Cjx0aXRsZT5aZWljaGVuZmzDpGNoZSAxPC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTIzNy41LDIyNy45YzAsNS4zLTQuMyw5LjYtOS41LDkuNmMwLDAsMCwwLDAsMEgyMi4xYy01LjMsMC05LjYtNC4zLTkuNi05LjVjMCwwLDAsMCwwLDBWMjIuMQoJYzAtNS4zLDQuMy05LjYsOS41LTkuNmMwLDAsMCwwLDAsMGgyMDUuOWM1LjMsMCw5LjYsNC4zLDkuNiw5LjVjMCwwLDAsMCwwLDBWMjI3Ljl6Ii8+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yMzcuNSwyMjcuOWMwLDUuMy00LjMsOS42LTkuNSw5LjZjMCwwLDAsMCwwLDBIODkuNkw0NC44LDE5MmwyNy45LTQ1LjVsODIuNy0xMDIuN2w4Mi4xLDg0LjVWMjI3Ljl6Ii8+CjxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xOTcuMSwxMzguM2gtMjMuN2wtMjUtNDIuN2M1LjctMS4yLDkuOC02LjIsOS43LTEyVjUxLjVjMC02LjgtNS40LTEyLjMtMTIuMi0xMi4zYzAsMC0wLjEsMC0wLjEsMGgtNDEuNwoJYy02LjgsMC0xMi4zLDUuNC0xMi4zLDEyLjJjMCwwLDAsMC4xLDAsMC4xdjMyLjFjMCw1LjgsNCwxMC44LDkuNywxMmwtMjUsNDIuN0g1Mi45Yy02LjgsMC0xMi4zLDUuNC0xMi4zLDEyLjJjMCwwLDAsMC4xLDAsMC4xCgl2MzIuMWMwLDYuOCw1LjQsMTIuMywxMi4yLDEyLjNjMCwwLDAuMSwwLDAuMSwwaDQxLjdjNi44LDAsMTIuMy01LjQsMTIuMy0xMi4yYzAsMCwwLTAuMSwwLTAuMXYtMzIuMWMwLTYuOC01LjQtMTIuMy0xMi4yLTEyLjMKCWMwLDAtMC4xLDAtMC4xLDBoLTRsMjQuOC00Mi40aDE5LjNsMjQuOSw0Mi40aC00LjFjLTYuOCwwLTEyLjMsNS40LTEyLjMsMTIuMmMwLDAsMCwwLjEsMCwwLjF2MzIuMWMwLDYuOCw1LjQsMTIuMywxMi4yLDEyLjMKCWMwLDAsMC4xLDAsMC4xLDBoNDEuN2M2LjgsMCwxMi4zLTUuNCwxMi4zLTEyLjJjMCwwLDAtMC4xLDAtMC4xdi0zMi4xYzAtNi44LTUuNC0xMi4zLTEyLjItMTIuMwoJQzE5Ny4yLDEzOC4zLDE5Ny4yLDEzOC4zLDE5Ny4xLDEzOC4zeiIvPgo8L3N2Zz4K'; 
var initialHtml = '<div id="graph" style="background-image:url(' + drawImage + ');' +
    'background-repeat:no-repeat;background-position:center top;position:relative;background-size: auto 64px;max-width:100%;width:100%;height:64px;"></div>';
var defaultConfig = '{"version": "1.0",\n"mathematicalTypesetting": true,\n"internationalization": true,\n"iconfinder": true,\n"plantUml": true,\n"pdfExport": true,\n' +
	'"remoteConvert": true,\n"defaultEdgeLength": 60,\n"defaultLibraries": "general;uml;er;flowchart;basic;arrows2",\n"customFonts": ["Salesforce Sans Web"],\n' +
    '"defaultVertexStyle": {"fontFamily": "Salesforce Sans Web", "fontSize": 14, "fontColor": "#333333", "strokeColor": "#333333"},\n' +
    '"defaultEdgeStyle": {"fontFamily": "Salesforce Sans Web", "fontSize": 13, "fontColor": "#333333", "strokeColor": "#333333", ' +
    '"edgeStyle": "orthogonalEdgeStyle", "jettySize": "auto", "orthogonalLoop": "1"},\n' +
    '"customPresetColors": ["ffbcc2", "fce8a8", "b4e5fa", "b4f0c2", "ffd1b9", "d4c7fc", "ff4050", "f7bc05", "29b6f2", "2ad352", "ff7c36", "855ff5"],\n' +
    '"customColorSchemes": [[null, {"fill": "none"},\n' +
	'{"fill": "#ffbcc2"}, {"fill": "#fce8a8"},\n' +
	'{"fill": "#b4e5fa"}, {"fill": "#b4f0c2"},\n' +
	'{"fill": "#ffd1b9"}, {"fill": "#d4c7fc"}],\n' +
	'[null, {"fill": "none"},\n' +
	'{"fill": "#ffecee", "stroke": "#ffcbce", "font": "#ff4050"}, {"fill": "#fff8e7", "stroke": "#ffebc2", "font": "#f7bc05"},\n' +
	'{"fill": "#e6f8fd", "stroke": "#c2ecfb", "font": "#29b6f2"}, {"fill": "#e7fbef", "stroke": "#c3f3d1", "font": "#2ad352"},\n' +
	'{"fill": "#fff2ec", "stroke": "#ffdac9", "font": "#ff7c36"}, {"fill": "#f3effd", "stroke": "#e0d1fa", "font": "#855ff5"}],\n' +
	'[null, {"fill": "none"},\n' +
	'{"fill": "#ff4050", "stroke": "#CC0D1D", "font": "#ffffff"}, {"fill": "#f7bc05", "stroke": "#C48900", "font": "#ffffff"},\n' +
	'{"fill": "#29b6f2", "stroke": "#0083BF", "font": "#ffffff"}, {"fill": "#2ad352", "stroke": "#00A01F", "font": "#ffffff"},\n' +
	'{"fill": "#ff7c36", "stroke": "#CC4903", "font": "#ffffff"}, {"fill": "#855ff5", "stroke": "#522CC2", "font": "#ffffff"}]]\n,' +
    '"fontCss": "@font-face {    font-family: \\"Salesforce Sans Web\\";    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/qDglS7ij-J3KmCbIBbRp9w\\");    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/qDglS7ij-J3KmCbIBbRp9w?#iefix\\") format(\\"embedded-opentype\\"), url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/ltBYBSH8O-l0MAtQjQq_bw\\") format(\\"woff\\");    font-weight: 400;    font-style: normal}@font-face {    font-family: \\"Salesforce Sans Web\\";    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/JARsV2-VySQhhcz6WEpmtw\\");    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/JARsV2-VySQhhcz6WEpmtw?#iefix\\") format(\\"embedded-opentype\\"), url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/1G0-6xZwU5kI_is5YhgFcw\\") format(\\"woff\\");    font-weight: 400;    font-style: italic}@font-face {    font-family: \\"Salesforce Sans Web\\";    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/M6BL4QMsIfajuWRBac0hOw\\");    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/M6BL4QMsIfajuWRBac0hOw?#iefix\\") format(\\"embedded-opentype\\"), url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/oU63uOobDJVXXUikyjI4qA\\") format(\\"woff\\");    font-weight: 700;    font-style: normal}@font-face {    font-family: \\"Salesforce Sans Web\\";    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/YN6M48LIBXRspvzW4sp12g\\");    src: url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/YN6M48LIBXRspvzW4sp12g?#iefix\\") format(\\"embedded-opentype\\"), url(\\"https://d2i1pl9gz4hwa7.cloudfront.net/66X8OtidjFn4_ADijgVevg\\") format(\\"woff\\");    font-weight: 700;    font-style: italic; }"}';

// Offline language support is limited to English to keep the .ele small. English resources from dia.txt must be copied to the line below:
// Replace \n with \\n and ' with \n (regex) in a text editor and paste between the quotes.
var defaultResources = 'aboutDrawio=About draw.io\naccessDenied=Access Denied\naction=Action\nactualSize=Actual Size\nadd=Add\naddedFile=Added {1}\naddImages=Add Images\naddImageUrl=Add Image URL\naddLayer=Add Layer\naddProperty=Add Property\naddress=Address\naddToExistingDrawing=Add to Existing Drawing\naddWaypoint=Add Waypoint\nadjustTo=Adjust to\nadvanced=Advanced\nalign=Align\nalignment=Alignment\nallChangesLost=All changes will be lost!\nallPages=All Pages\nallProjects=All Projects\nallSpaces=All Spaces\nallTags=All Tags\nanchor=Anchor\nandroid=Android\nangle=Angle\narc=Arc\nareYouSure=Are you sure?\nensureDataSaved=Please ensure your data is saved before closing.\nallChangesSaved=All changes saved\nallChangesSavedInDrive=All changes saved in Drive\nallowPopups=Allow pop-ups to avoid this dialog.\nallowRelativeUrl=Allow relative URL\nalreadyConnected=Nodes already connected\napply=Apply\narchiMate21=ArchiMate 2.1\narrange=Arrange\narrow=Arrow\narrows=Arrows\nasNew=As New\natlas=Atlas\nauthor=Author\nauthorizationRequired=Authorization required\nauthorizeThisAppIn=Authorize this app in {1}:\nauthorize=Authorize\nauthorizing=Authorizing\nautomatic=Automatic\nautosave=Autosave\nautosize=Autosize\nattachments=Attachments\naws=AWS\naws3d=AWS 3D\nazure=Azure\nback=Back\nbackground=Background\nbackgroundColor=Background Color\nbackgroundImage=Background Image\nbasic=Basic\nblankDrawing=Blank Drawing\nblankDiagram=Blank Diagram\nblock=Block\nblockquote=Blockquote\nblog=Blog\nbold=Bold\nbootstrap=Bootstrap\nborder=Border\nborderColor=Border Color\nborderWidth=Borderwidth\nbottom=Bottom\nbottomAlign=Bottom Align\nbottomLeft=Bottom Left\nbottomRight=Bottom Right\nbpmn=BPMN\nbrowser=Browser\nbulletedList=Bulleted List\nbusiness=Business\nbusy=Operation in progress\ncabinets=Cabinets\ncancel=Cancel\ncenter=Center\ncannotLoad=Load attempts failed. Please try again later.\ncannotLogin=Log in attempts failed. Please try again later.\ncannotOpenFile=Cannot open file\nchange=Change\nchangeOrientation=Change Orientation\nchangeUser=Change user\nchangeStorage=Change storage\nchangesNotSaved=Changes have not been saved\nuserJoined={1} has joined\nuserLeft={1} has left\nchatWindowTitle=Chat\nchooseAnOption=Choose an option\nchromeApp=Chrome App\ncollaborativeEditingNotice=Important Notice for Collaborative Editing\ncompressed=Compressed\ncommitMessage=Commit Message\ncsv=CSV\ndark=Dark\ndraftFound=A draft for \'{1}\' has been found. Load it into the editor or discard it to continue.\ndragAndDropNotSupported=Drag and drop not supported for images. Would you like to import instead?\ndropboxCharsNotAllowed=The following characters are not allowed: \ / : ? * " |\ncheck=Check\nchecksum=Checksum\ncircle=Circle\ncisco=Cisco\nclassic=Classic\nclearDefaultStyle=Clear Default Style\nclearWaypoints=Clear Waypoints\nclipart=Clipart\nclose=Close\ncollaborator=Collaborator\ncollaborators=Collaborators\ncollapse=Collapse\ncollapseExpand=Collapse/Expand\ncollapse-expand=Click to collapse/expand\nShift-click to move neighbors \nAlt-click to protect group size\ncollapsible=Collapsible\ncomic=Comic\ncomment=Comment\ncommentsNotes=Comments/Notes\ncompress=Compress\nconnect=Connect\nconnecting=Connecting\nconnectWithDrive=Connect with Google Drive\nconnection=Connection\nconnectionArrows=Connection Arrows\nconnectionPoints=Connection Points\nconstrainProportions=Constrain Proportions\ncontainsValidationErrors=Contains validation errors\ncopiedToClipboard=Copied to clipboard\ncopy=Copy\ncopyConnect=Copy on connect\ncopyOf=Copy of {1}\ncopyOfDrawing=Copy of Drawing\ncopySize=Copy Size\ncopyStyle=Copy Style\ncreate=Create\ncreateNewDiagram=Create New Diagram\ncreateRevision=Create Revision\ncreateShape=Create Shape\ncrop=Crop\ncurved=Curved\ncustom=Custom\ncurrent=Current\ncut=Cut\ndashed=Dashed\ndecideLater=Decide later\ndefault=Default\ndelete=Delete\ndeleteColumn=Delete Column\ndeleteLibrary401=Insufficient permissions to delete this library\ndeleteLibrary404=Selected library could not be found\ndeleteLibrary500=Error deleting library\ndeleteLibraryConfirm=You are about to permanently delete this library. Are you sure you want to do this?\ndeleteRow=Delete Row\ndescription=Description\ndevice=Device\ndiagram=Diagram\ndiagramContent=Diagram Content\ndiagramLocked=Diagram has been locked to prevent further data loss.\ndiagramLockedBySince=The diagram is locked by {1} since {2} ago\ndiagramName=Diagram Name\ndiagramIsPublic=Diagram is public\ndiagramIsNotPublic=Diagram is not public\ndiamond=Diamond\ndiamondThin=Diamond (thin)\ndidYouKnow=Did you know...\ndirection=Direction\ndiscard=Discard\ndiscardChangesAndReconnect=Discard Changes and Reconnect\ngoogleDriveMissingClickHere=Google Drive missing? Click here!\ndiscardChanges=Discard Changes\ndisconnected=Disconnected\ndistribute=Distribute\ndone=Done\ndotted=Dotted\ndoubleClickOrientation=Doubleclick to change orientation\ndoubleClickTooltip=Doubleclick to insert text\ndoubleClickChangeProperty=Doubleclick to change property name\ndownload=Download\ndownloadDesktop=Download draw.io Desktop\ndownloadAs=Download as\nclickHereToSave=Click here to save.\ndraftDiscarded=Draft discarded\ndraftSaved=Draft saved\ndragElementsHere=Drag elements here\ndragImagesHere=Drag images or URLs here\ndragUrlsHere=Drag URLs here\ndraw.io=draw.io\ndrawing=Drawing{1}\ndrawingEmpty=Drawing is empty\ndrawingTooLarge=Drawing is too large\ndrawioForWork=Draw.io for GSuite\ndropbox=Dropbox\nduplicate=Duplicate\nduplicateIt=Duplicate {1}\ndivider=Divider\ndx=Dx\ndy=Dy\neast=East\nedit=Edit\neditData=Edit Data\neditDiagram=Edit Diagram\neditGeometry=Edit Geometry\neditImage=Edit Image\neditImageUrl=Edit Image URL\neditLink=Edit Link\neditShape=Edit Shape\neditStyle=Edit Style\neditText=Edit Text\neditTooltip=Edit Tooltip\nglass=Glass\ngoogleImages=Google Images\nimageSearch=Image Search\neip=EIP\nembed=Embed\nembedImages=Embed Images\nmainEmbedNotice=Paste this into the page\nelectrical=Electrical\nellipse=Ellipse\nembedNotice=Paste this once at the end of the page\nenterGroup=Enter Group\nenterName=Enter Name\nenterPropertyName=Enter Property Name\nenterValue=Enter Value\nentityRelation=Entity Relation\nerror=Error\nerrorDeletingFile=Error deleting file\nerrorLoadingFile=Error loading file\nerrorRenamingFile=Error renaming file\nerrorRenamingFileNotFound=Error renaming file. File was not found.\nerrorRenamingFileForbidden=Error renaming file. Insufficient access rights.\nerrorSavingDraft=Error saving draft\nerrorSavingFile=Error saving file\nerrorSavingFileUnknown=Error authorizing with Google\'s servers. Please refresh the page to re-attempt.\nerrorSavingFileForbidden=Error saving file. Insufficient access rights.\nerrorSavingFileNameConflict=Could not save diagram. Current page already contains file named \'{1}\'.\nerrorSavingFileNotFound=Error saving file. File was not found.\nerrorSavingFileReadOnlyMode=Could not save diagram while read-only mode is active.\nerrorSavingFileSessionTimeout=Your session has ended. Please <a target=\'_blank\' href=\'{1}\'>{2}</a> and return to this tab to try to save again.\nerrorSendingFeedback=Error sending feedback.\nerrorUpdatingPreview=Error updating preview.\nexit=Exit\nexitGroup=Exit Group\nexpand=Expand\nexport=Export\nexporting=Exporting\nexportAs=Export as\nexportOptionsDisabled=Export options disabled\nexportOptionsDisabledDetails=The owner has disabled options to download, print or copy for commenters and viewers on this file.\nexternalChanges=External Changes\nextras=Extras\nfacebook=Facebook\nfailedToSaveTryReconnect=Failed to save, trying to reconnect\nfeatureRequest=Feature Request\nfeedback=Feedback\nfeedbackSent=Feedback successfully sent.\nfloorplans=Floorplans\nfile=File\nfileChangedOverwriteDialog=The file has been modified. Do you want to save the file and overwrite those changes?\nfileChangedSyncDialog=The file has been modified. Do you want to synchronize those changes?\nfileChangedSync=The file has been modified. Click here to synchronize.\noverwrite=Overwrite\nsynchronize=Synchronize\nfilename=Filename\nfileExists=File already exists\nfileNearlyFullSeeFaq=File nearly full, please see FAQ\nfileNotFound=File not found\nrepositoryNotFound=Repository not found\nfileNotFoundOrDenied=The file was not found. It does not exist or you do not have read access.\nfileNotLoaded=File not loaded\nfileNotSaved=File not saved\nfileOpenLocation=How would you like to open these file(s)?\nfiletypeHtml=.html causes file to save as HTML with redirect to cloud URL\nfiletypePng=.png causes file to save as PNG with embedded data\nfiletypeSvg=.svg causes file to save as SVG with embedded data\nfileWillBeSavedInAppFolder={1} will be saved in the app folder.\nfill=Fill\nfillColor=Fill Color\nfilterCards=Filter Cards\nfind=Find\nfit=Fit\nfitContainer=Resize Container\nfitIntoContainer=Fit into Container\nfitPage=Fit Page\nfitPageWidth=Fit Page Width\nfitTo=Fit to\nfitToSheetsAcross=sheet(s) across\nfitToBy=by\nfitToSheetsDown=sheet(s) down\nfitTwoPages=Two Pages\nfitWindow=Fit Window\nflip=Flip\nflipH=Flip Horizontal\nflipV=Flip Vertical\nflowchart=Flowchart\nfolder=Folder\nfont=Font\nfontColor=Font Color\nfontFamily=Font Family\nfontSize=Font Size\nforbidden=You are not authorized to access this file\nformat=Format\nformatPanel=Format Panel\nformatted=Formatted\nformattedText=Formatted Text\nformatPng=PNG\nformatGif=GIF\nformatJpg=JPEG\nformatPdf=PDF\nformatSql=SQL\nformatSvg=SVG\nformatHtmlEmbedded=HTML\nformatSvgEmbedded=SVG (with XML)\nformatVsdx=VSDX\nformatVssx=VSSX\nformatXmlPlain=XML (Plain)\nformatXml=XML\nforum=Discussion/Help Forums\nfromTemplate=From Template\nfromTemplateUrl=From Template URL\nfromText=From Text\nfromUrl=From URL\nfromThisPage=From this page\nfullscreen=Fullscreen\ngap=Gap\ngcp=GCP\ngeneral=General\ngithub=GitHub\ngliffy=Gliffy\nglobal=Global\ngoogleDocs=Google Docs\ngoogleDrive=Google Drive\ngoogleGadget=Google Gadget\ngooglePlus=Google+\ngoogleSharingNotAvailable=Sharing is only available via Google Drive. Please click Open below and share from the more actions menu:\ngoogleSlides=Google Slides\ngoogleSites=Google Sites\ngradient=Gradient\ngradientColor=Color\ngrid=Grid\ngridColor=Grid Color\ngridSize=Grid Size\ngroup=Group\nguides=Guides\nhateApp=I hate draw.io\nheading=Heading\nheight=Height\nhelp=Help\nhelpTranslate=Help us translate this application\nhide=Hide\nhideIt=Hide {1}\nhidden=Hidden\nhome=Home\nhorizontal=Horizontal\nhorizontalFlow=Horizontal Flow\nhorizontalTree=Horizontal Tree\nhowTranslate=How good is the translation in your language?\nhtml=HTML\nhtmlText=HTML Text\nid=ID\niframe=IFrame\nignore=Ignore\nimage=Image\nimageUrl=Image URL\nimages=Images\nimagePreviewError=This image couldn\'t be loaded for preview. Please check the URL.\nimageTooBig=Image too big\nimgur=Imgur\nimport=Import\nimportFrom=Import from\nincludeCopyOfMyDiagram=Include a copy of my diagram\nincreaseIndent=Increase Indent\ndecreaseIndent=Decrease Indent\ninsert=Insert\ninsertColumnBefore=Insert Column Left\ninsertColumnAfter=Insert Column Right\ninsertEllipse=Insert Ellipse\ninsertImage=Insert Image\ninsertHorizontalRule=Insert Horizontal Rule\ninsertLink=Insert Link\ninsertPage=Insert Page\ninsertRectangle=Insert Rectangle\ninsertRhombus=Insert Rhombus\ninsertRowBefore=Insert Row Above\ninsertRowAfter=Insert Row After\ninsertText=Insert Text\ninserting=Inserting\ninvalidFilename=Diagram names must not contain the following characters: \ / | : ; { } < > & + ? = "\ninvalidLicenseSeeThisPage=Your license is invalid, please see this <a target="_blank" href="https://support.draw.io/display/DFCS/Licensing+your+draw.io+plugin">page</a>.\ninvalidName=Invalid name\ninvalidOrMissingFile=Invalid or missing file\ninvalidPublicUrl=Invalid public URL\nisometric=Isometric\nios=iOS\nitalic=Italic\nkennedy=Kennedy\nkeyboardShortcuts=Keyboard Shortcuts\nlayers=Layers\nlandscape=Landscape\nlanguage=Language\nleanMapping=Lean Mapping\nlastChange=Last change {1} ago\nlessThanAMinute=less than a minute\nlicensingError=Licensing Error\nlicenseHasExpired=The license for {1} has expired on {2}. Click here.\nlicenseWillExpire=The license for {1} will expire on {2}. Click here.\nlineJumps=Line jumps\nlinkAccountRequired=If the diagram is not public a Google account is required to view the link.\nlinkText=Link Text\nlist=List\nminute=minute\nminutes=minutes\nhours=hours\ndays=days\nmonths=months\nyears=years\nrestartForChangeRequired=Changes will take effect after page refresh.\nlaneColor=Lanecolor\nlastModified=Last modified\nlayout=Layout\nleft=Left\nleftAlign=Left Align\nleftToRight=Left to right\nlibraryTooltip=Drag and drop shapes here or click + to insert. Double click to edit.\nlightbox=Lightbox\nline=Line\nlineend=Line end\nlineheight=Line Height\nlinestart=Line start\nlinewidth=Linewidth\nlink=Link\nlinks=Links\nloading=Loading\nlockUnlock=Lock/Unlock\nloggedOut=Logged Out\nlogIn=log in\nloveIt=I love {1}\nlucidchart=Lucidchart\nmaps=Maps\nmathematicalTypesetting=Mathematical Typesetting\nmakeCopy=Make a Copy\nmanual=Manual\nmicrosoftExcel=Microsoft Excel\nmicrosoftPowerPoint=Microsoft PowerPoint\nmicrosoftWord=Microsoft Word\nmiddle=Middle\nminimal=Minimal\nmisc=Misc\nmockups=Mockups\nmodificationDate=Modification date\nmodifiedBy=Modified by\nmore=More\nmoreResults=More Results\nmoreShapes=More Shapes\nmove=Move\nmoveToFolder=Move to Folder\nmoving=Moving\nmoveSelectionTo=Move selection to {1}\nname=Name\nnavigation=Navigation\nnetwork=Network\nnetworking=Networking\nnew=New\nnewLibrary=New Library\nnextPage=Next Page\nno=No\nnoPickFolder=No, pick folder\nnoAttachments=No attachments found\nnoColor=No Color\nnoFiles=No Files\nnoFileSelected=No file selected\nnoLibraries=No libraries found\nnoMoreResults=No more results\nnone=None\nnoOtherViewers=No other viewers\nnoPlugins=No plugins\nnoPreview=No preview\nnoResponse=No response from server\nnoResultsFor=No results for \'{1}\'\nnoRevisions=No revisions\nnoSearchResults=No search results found\nnoPageContentOrNotSaved=No anchors found on this page or it hasn\'t been saved yet\nnormal=Normal\nnorth=North\nnotADiagramFile=Not a diagram file\nnotALibraryFile=Not a library file\nnotAvailable=Not available\nnotAUtf8File=Not a UTF-8 file\nnotConnected=Not connected\nnote=Note\nnotUsingService=Not using {1}?\nnumberedList=Numbered list\noffline=Offline\nok=OK\noneDrive=OneDrive\nonline=Online\nopacity=Opacity\nopen=Open\nopenArrow=Open Arrow\nopenExistingDiagram=Open Existing Diagram\nopenFile=Open File\nopenFrom=Open from\nopenLibrary=Open Library\nopenLibraryFrom=Open Library from\nopenLink=Open Link\nopenInNewWindow=Open in New Window\nopenInThisWindow=Open in This Window\nopenIt=Open {1}\nopenRecent=Open Recent\nopenSupported=Supported formats are files saved from this software (.xml), .vsdx and .gliffy\noptions=Options\norganic=Organic\northogonal=Orthogonal\notherViewer=other viewer\notherViewers=other viewers\noutline=Outline\noval=Oval\npage=Page\npageContent=Page Content\npageNotFound=Page not found\npageWithNumber=Page-{1}\npages=Pages\npageView=Page View\npageSetup=Page Setup\npageScale=Page Scale\npan=Pan\npanTooltip=Space+Drag to pan\npaperSize=Paper Size\npattern=Pattern\npaste=Paste\npasteHere=Paste here\npasteSize=Paste Size\npasteStyle=Paste Style\nperimeter=Perimeter\npermissionAnyone=Anyone can edit\npermissionAuthor=Owner and admins can edit\npickFolder=Pick a folder\npickLibraryDialogTitle=Select Library\npublicDiagramUrl=Public URL of the diagram\nplaceholders=Placeholders\nplantUml=PlantUML\nplugins=Plugins\npluginUrl=Plugin URL\npluginWarning=The page has requested to load the following plugin(s):\n \n {1}\n \n Would you like to load these plugin(s) now?\n \n NOTE : Only allow plugins to run if you fully understand the security implications of doing so.\n\nplusTooltip=Click to connect and clone (ctrl+click to clone, shift+click to connect). Drag to connect (ctrl+drag to clone).\nportrait=Portrait\nposition=Position\nposterPrint=Poster Print\npreferences=Preferences\npreview=Preview\npreviousPage=Previous Page\nprint=Print\nprintAllPages=Print All Pages\nprocEng=Proc. Eng.\nproject=Project\npriority=Priority\nproperties=Properties\npublish=Publish\nquickStart=Quick Start Video\nrack=Rack\nradialTree=Radial Tree\nreadOnly=Read-only\nreconnecting=Reconnecting\nrecentlyUpdated=Recently Updated\nrecentlyViewed=Recently Viewed\nrectangle=Rectangle\nredirectToNewApp=This file was created or modified in a newer version of this app. You will be redirected now.\nrealtimeTimeout=It looks like you\'ve made a few changes while offline. We\'re sorry, these changes cannot be saved.\nredo=Redo\nrefresh=Refresh\nregularExpression=Regular Expression\nrelative=Relative\nrelativeUrlNotAllowed=Relative URL not allowed\nrememberMe=Remember me\nrememberThisSetting=Remember this setting\nremoveFormat=Clear Formatting\nremoveFromGroup=Remove from Group\nremoveIt=Remove {1}\nremoveWaypoint=Remove Waypoint\nrename=Rename\nrenamed=Renamed\nrenameIt=Rename {1}\nrenaming=Renaming\nreplace=Replace\nreplaceIt={1} already exists. Do you want to replace it?\nreplaceExistingDrawing=Replace existing drawing\nrequired=required\nreset=Reset\nresetView=Reset View\nresize=Resize\nresizeLargeImages=Do you want to resize large images to make the application run faster?\nretina=Retina\nresponsive=Responsive\nrestore=Restore\nrestoring=Restoring\nretryingIn=Retrying in {1} second(s)\nretryingLoad=Load failed. Retrying...\nretryingLogin=Login time out. Retrying...\nreverse=Reverse\nrevision=Revision\nrevisionHistory=Revision History\nrhombus=Rhombus\nright=Right\nrightAlign=Right Align\nrightToLeft=Right to left\nrotate=Rotate\nrotateTooltip=Click and drag to rotate, click to turn shape only by 90 degrees\nrotation=Rotation\nrounded=Rounded\nsave=Save\nsaveAndExit=Save & Exit\nsaveAs=Save as\nsaveAsXmlFile=Save as XML file?\nsaved=Saved\nsaveDiagramsTo=Save diagrams to\nsaveLibrary403=Insufficient permissions to edit this library\nsaveLibrary500=There was an error while saving the library\nsaving=Saving\nscratchpad=Scratchpad\nscrollbars=Scrollbars\nsearch=Search\nsearchShapes=Search Shapes\nselectAll=Select All\nselectionOnly=Selection Only\nselectCard=Select Card\nselectEdges=Select Edges\nselectFile=Select File\nselectFolder=Select Folder\nselectFont=Select Font\nselectNone=Select None\nselectTemplate=Select Template\nselectVertices=Select Vertices\nsendMessage=Send\nsendYourFeedbackToDrawIo=Send your feedback to draw.io\nserviceUnavailableOrBlocked=Service unavailable or blocked\nsessionExpired=Your session has expired. Please refresh the browser window.\nsessionTimeoutOnSave=Your session has timed out and you have been disconnected from the Google Drive. Press OK to login and save. \nsetAsDefaultStyle=Set as Default Style\nshadow=Shadow\nshape=Shape\nshapes=Shapes\nshare=Share\nshareLink=Link for shared editing\nsharp=Sharp\nshow=Show\nshowStartScreen=Show Start Screen\nsidebarTooltip=Click to expand. Drag and drop shapes into the diagram. Shift+click to change selection. Alt+click to insert and connect.\nsigns=Signs\nsignOut=Sign out\nsimple=Simple\nsimpleArrow=Simple Arrow\nsimpleViewer=Simple Viewer\nsize=Size\nsolid=Solid\nsourceSpacing=Source Spacing\nsouth=South\nsoftware=Software\nspace=Space\nspacing=Spacing\nspecialLink=Special Link\nstandard=Standard\nstarting=Starting\nstraight=Straight\nstrikethrough=Strikethrough\nstrokeColor=Line Color\nstyle=Style\nsubscript=Subscript\nsummary=Summary\nsuperscript=Superscript\nsupport=Support\nsysml=SysML\ntags=Tags\ntable=Table\ntables=Tables\ntakeOver=Take Over\ntargetSpacing=Target Spacing\ntemplate=Template\ntemplates=Templates\ntext=Text\ntextAlignment=Text Alignment\ntextOpacity=Text Opacity\ntheme=Theme\ntimeout=Timeout\ntitle=Title\nto=to\ntoBack=To Back\ntoFront=To Front\ntoolbar=Toolbar\ntooltips=Tooltips\ntop=Top\ntopAlign=Top Align\ntopLeft=Top Left\ntopRight=Top Right\ntransparent=Transparent\ntransparentBackground=Transparent Background\ntrello=Trello\ntryAgain=Try again\ntryOpeningViaThisPage=Try opening via this page\nturn=Rotate shape only by 90°\ntype=Type\ntwitter=Twitter\numl=UML\nunderline=Underline\nundo=Undo\nungroup=Ungroup\nunsavedChanges=Unsaved changes\nunsavedChangesClickHereToSave=Unsaved changes. Click here to save.\nuntitled=Untitled\nuntitledDiagram=Untitled Diagram\nuntitledLayer=Untitled Layer\nuntitledLibrary=Untitled Library\nunknownError=Unknown error\nupdateFile=Update {1}\nupdatingDocument=Updating Document. Please wait...\nupdatingPreview=Updating Preview. Please wait...\nupdatingSelection=Updating Selection. Please wait...\nupload=Upload\nurl=URL\nuseOffline=Use Offline\nuseRootFolder=Use root folder?\nuserManual=User Manual\nvertical=Vertical\nverticalFlow=Vertical Flow\nverticalTree=Vertical Tree\nview=View\nviewerSettings=Viewer Settings\nviewUrl=Link to view: {1}\nvoiceAssistant=Voice Assistant (beta)\nwarning=Warning\nwaypoints=Waypoints\nwest=West\nwidth=Width\nwiki=Wiki\nwordWrap=Word Wrap\nwritingDirection=Writing Direction\nyes=Yes\nyourEmailAddress=Your email address\nzoom=Zoom\nzoomIn=Zoom In\nzoomOut=Zoom Out\nbasic=Basic\nbusinessprocess=Business Processes\ncharts=Charts\nengineering=Engineering\nflowcharts=Flowcharts\ngmdl=Material Design\nmindmaps=Mindmaps\nmockups=Mockups\nnetworkdiagrams=Network Diagrams\nnothingIsSelected=Nothing is selected\nother=Other\nsoftwaredesign=Software Design\nvenndiagrams=Venn Diagrams\nwebEmailOrOther=Web, email or any other internet address\nwebLink=Web Link\nwireframes=Wireframes\nproperty=Property\nvalue=Value\nshowMore=Show More\nshowLess=Show Less\nmyDiagrams=My Diagrams\nallDiagrams=All Diagrams\nrecentlyUsed=Recently used\nlistView=List view\ngridView=Grid view\nresultsFor=Results for \'{1}\'\noneDriveCharsNotAllowed=The following characters are not allowed: ~ " # %  * : < > ? / \ { | }\noneDriveInvalidDeviceName=The specified device name is invalid\nofficeNotLoggedOD=You are not logged in to OneDrive. Please open draw.io task pane and login first.\nofficeSelectSingleDiag=Please select a single draw.io diagram only without other contents.\nofficeSelectDiag=Please select a draw.io diagram.\nofficeCannotFindDiagram=Cannot find a draw.io diagram in the selection\nnoDiagrams=No diagrams found\nauthFailed=Authentication failed\nofficeFailedAuthMsg=Unable to successfully authenticate user or authorize application.\nconvertingDiagramFailed=Converting diagram failed\nofficeCopyImgErrMsg=Due to some limitations in the host application, the image could not be inserted. Please manually copy the image then paste it to the document.\ninsertingImageFailed=Inserting image failed\nofficeCopyImgInst=Instructions: Right-click the image below. Select "Copy image" from the context menu. Then, in the document, right-click and select "Paste" from the context menu.\nfolderEmpty=Folder is empty\nrecent=Recent\nsharedWithMe=Shared With Me\nsharepointSites=Sharepoint Sites\nerrorFetchingFolder=Error fetching folder items\nerrorAuthOD=Error authenticating to OneDrive\nofficeCannotFindDiagram=Cannot find a draw.io diagram in the selection\nofficeMainHeader=draw.io adds diagrams from OneDrive to your document.\nofficeStepsHeader=This add-in performs the following steps:\nofficeStep1=Connects to OneDrive.\nofficeStep2=Select a draw.io diagram from OneDrive.\nofficeStep3=Insert the diagram into the document.\nofficeAuthPopupInfo=Please complete the authentication in the pop-up window.\nofficeSelDiag=Select draw.io Diagram:\nfiles=Files\nshared=Shared\nsharepoint=Sharepoint\nofficeManualUpdateInst=Instructions: Copy draw.io diagram from the document. Then, in the box below, right-click and select "Paste" from the context menu.\nofficeClickToEdit=Click icon to start editing:\npasteDiagram=Paste draw.io diagram here\nconnectOD=Connect to OneDrive\nselectChildren=Select Children\nselectSiblings=Select Siblings\nselectParent=Select Parent\nselectDescendants=Select Descendants\nlastSaved=Last saved {1} ago\nresolve=Resolve\nreopen=Re-open\nshowResolved=Show Resolved\nreply=Reply\nobjectNotFound=Object not found\nreOpened=Re-opened\nmarkedAsResolved=Marked as resolved\nnoCommentsFound=No comments found\ncomments=Comments\ntimeAgo={1} ago\nconfluenceCloud=Confluence Cloud\nlibraries=Libraries\n';
var spinImage = 'data:image/gif;base64,R0lGODlhDAAMAPUxAEVriVp7lmCAmmGBm2OCnGmHn3OPpneSqYKbr4OcsIScsI2kto6kt46lt5KnuZmtvpquvpuvv56ywaCzwqK1xKu7yay9yq+/zLHAzbfF0bjG0bzJ1LzK1MDN18jT28nT3M3X3tHa4dTc49Xd5Njf5dng5t3k6d/l6uDm6uru8e7x8/Dz9fT29/b4+Pj5+fj5+vr6+v///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkKADEAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAADAAMAAAGR8CYcEgsOgYAIax4CCQuQldrCBEsiK8VS2hoFGOrlJDA+cZQwkLnqyoJFZKviSS0ICrE0ec0jDAwIiUeGyBFGhMPFBkhZo1BACH5BAkKAC4ALAAAAAAMAAwAhVB0kFR3k1V4k2CAmmWEnW6Lo3KOpXeSqH2XrIOcsISdsImhtIqhtJCmuJGnuZuwv52wwJ+ywZ+ywqm6yLHBzbLCzrXEz7fF0LnH0rrI0r7L1b/M1sXR2cfT28rV3czW3s/Z4Nfe5Nvi6ODm6uLn6+Ln7OLo7OXq7efs7+zw8u/y9PDy9PX3+Pr7+////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZDQJdwSCxGDAIAoVFkFBwYSyIwGE4OkCJxIdG6WkJEx8sSKj7elfBB0a5SQg1EQ0SVVMPKhDM6iUIkRR4ZFxsgJl6JQQAh+QQJCgAxACwAAAAADAAMAIVGa4lcfZdjgpxkg51nhp5ui6N3kqh5lKqFnbGHn7KIoLOQp7iRp7mSqLmTqbqarr6br7+fssGitcOitcSuvsuuv8uwwMyzw861xNC5x9K6x9K/zNbDztjE0NnG0drJ1NzQ2eDS2+LT2+LV3ePZ4Oba4ebb4ufc4+jm6+7t8PLt8PPt8fPx8/Xx9PX09vf19/j3+Pn///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQ8CYcEgsUhQFggFSjCQmnE1jcBhqGBXiIuAQSi7FGEIgfIzCFoCXFCZiPO0hKBMiwl7ET6eUYqlWLkUnISImKC1xbUEAIfkECQoAMgAsAAAAAAwADACFTnKPT3KPVHaTYoKcb4yjcY6leZSpf5mtgZuvh5+yiqG0i6K1jqW3kae5nrHBnrLBn7LCoLPCobTDqbrIqrvIs8LOtMPPtcPPtcTPuMbRucfSvcrUvsvVwMzWxdHaydTcytXdzNbezdff0drh2ODl2+Ln3eTp4Obq4ujs5Ont5uvu6O3w6u7w6u7x7/L09vj5+vr7+vv7////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkdAmXBILHIcicOCUqxELKKPxKAYgiYd4oMAEWo8RVmjIMScwhmBcJMKXwLCECmMGAhPI1QRwBiaSixCMDFhLSorLi8wYYxCQQAh+QQJCgAxACwAAAAADAAMAIVZepVggJphgZtnhp5vjKN2kah3kqmBmq+KobSLorWNpLaRp7mWq7ybr7+gs8KitcSktsWnuManucexwM2ywc63xtG6yNO9ytS+ytW/zNbDz9jH0tvL1d3N197S2+LU3OPU3ePV3eTX3+Xa4efb4ufd5Onl6u7r7vHs7/Lt8PLw8/Xy9Pby9fb09ff2+Pn3+Pn6+vr///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGSMCYcEgseiwSR+RS7GA4JFGF8RiWNiEiJTERgkjFGAQh/KTCGoJwpApnBkITKrwoCFWnFlEhaAxXLC9CBwAGRS4wQgELYY1CQQAh+QQJCgAzACwAAAAADAAMAIVMcI5SdZFhgZtti6JwjaR4k6mAma6Cm6+KobSLorWLo7WNo7aPpredsMCescGitMOitcSmuMaqu8ixwc2zws63xdC4xtG5x9K9ytXAzdfCztjF0NnF0drK1d3M1t7P2N/P2eDT2+LX3+Xe5Onh5+vi5+vj6Ozk6e3n7O/o7O/q7vHs7/Lt8PPu8fPx8/X3+Pn6+vv7+/v8/Pz///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRcCZcEgsmkIbTOZTLIlGqZNnchm2SCgiJ6IRqljFmQUiXIVnoITQde4chC9Y+LEQxmTFRkFSNFAqDAMIRQoCAAEEDmeLQQAh+QQJCgAwACwAAAAADAAMAIVXeZRefplff5lhgZtph59yjqV2kaeAmq6FnbGFnrGLorWNpLaQp7mRqLmYrb2essGgs8Klt8apusitvcquv8u2xNC7yNO8ydS8ytTAzdfBzdfM1t7N197Q2eDU3OPX3+XZ4ObZ4ebc4+jf5erg5erg5uvp7fDu8fPv8vTz9fb09vf19/j3+Pn4+fn5+vr6+/v///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGRUCYcEgspkwjEKhUVJ1QsBNp0xm2VixiSOMRvlxFGAcTJook5eEHIhQcwpWIkAFQECkNy9AQWFwyEAkPRQ4FAwQIE2llQQAh+QQJCgAvACwAAAAADAAMAIVNcY5SdZFigptph6BvjKN0kKd8lquAmq+EnbGGn7KHn7ONpLaOpbearr+csMCdscCescGhtMOnuMauvsuzws60w862xdC9ytW/y9a/zNbCztjG0drH0tvK1N3M1t7N19/U3ePb4uff5urj6Ozk6e3l6u7m6u7o7PDq7vDt8PPv8vTw8vTw8/X19vf6+vv///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQ8CXcEgsvlytVUplJLJIpSEDUESFTELBwSgCCQEV42kjDFiMo4uQsDB2MkLHoEHUTD7DRAHC8VAiZ0QSCgYIDxhNiUEAOw==';
var exportCss = '* {-webkit-font-smoothing: antialiased; } h1, h2, h3, h4, table, tr, td, th, tbody { border:0; margin:0; padding:0; font-size:14px; }' +
    'table, tr, td, th, tbody { text-align:left; font-weight:400 } table { border-collapse:collapse; border-spacing:0; white-space:inherit; line-height:inherit; }';
var rootRecord = null;
var defaultHeight = 550;
var blankHeight = 420;
var defaultMaxZoom = 1;
var viewerConfig = null;
var fullscreen = false;
var previousParent = null;
var padding = 18;
var locked = false;
var border = 0;
var container = null;
var preview = null;
var graph = null;
var dlg = null;
var ui = null;
var minZIndex = 301;
var sessionId = guid();
var revCounter = 0;
var deleteData = false;
var ignoreFocus = false;
var initialPageId = null;
var snapshotObj = null;
var ignoreEscape = false;
var hidingPreview = false;
var sidebarWindowVisible = false;
var formatWindowVisible = false;
var outlineWindowVisible = false;
var layersWindowVisible = false;
var tagsWindowVisible = false;
var findWindowVisible = false;
var pageVisible = false;
var gridVisible = false;

//Restores default CSS
(function()
{
    try
    {
       var style = document.createElement('style')
       style.type = 'text/css';
       style.innerHTML = '.geDiagramContainer a, #preview a { color: #0000ff; text-decoration: underline; cursor: pointer; }' +
           '.geTemplate td { text-align:center;}' +
           '#preview svg { outline: none;}, html body .geDialog * { font-size:12px; }' +
           'html body .mxWindow button.geBtn { font-size:12px !important; margin-left: 0; }' +
           'html body #graph button, html body button.geBtn { font-size:14px; font-weight:700;border-radius: 5px;display: inline-block; }' +
           '.geDialog input, .geToolbarContainer input, .mxWindow input {padding:2px !important;display:inline-block !important; }' +
           '.geDialog img, .mxWindow img { vertical-align: initial !important; }' +
           'div.geDialog { border-radius: 5px; }' +
       	   'html body table.mxWindow td.mxWindowPane div.mxWindowPane *:not(svg *) { font-size:9pt; }' +
           '.mxWindow button, .geDialog select, .mxWindow select { display:inline-block; }' +
           'html body .mxWindow .geColorBtn, html body .geDialog .geColorBtn { background: none; }' +
           'html body #graph button, html body .mxWindow button, html body .geDialog button { min-width: 0px; border-radius: 5px; color: #353535 !important; border-style: solid; border-width: 1px; border-color: rgb(216, 216, 216); }' +
           'html body #graph button:hover, html body .mxWindow button:hover, html body .geDialog button:hover { border-color: rgb(177, 177, 177); }' +
           'html body #graph button:active, html body .mxWindow button:active, html body .geDialog button:active { opacity: 0.6; }' +
           '#graph button.geBtn, .mxWindow button.geBtn, .geDialog button.geBtn { min-width:72px; font-weight: 700; background: none; }' +
           '#graph button.geBtn:hover, .mxWindow button.geBtn:hover, .geDialog button.geBtn:hover { box-shadow: none; border-color: rgb(216, 216, 216); }' +
           '#graph button.gePrimaryBtn, .mxWindow button.gePrimaryBtn, .geDialog button.gePrimaryBtn, html body .gePrimaryBtn { background: rgb(41, 182, 242); color: #fff !important; border: none; box-shadow: none; }' +
           'html body .gePrimaryBtn:hover { background: rgb(41, 182, 242); border: none; box-shadow: inherit; }' +
           'html body button.gePrimaryBtn:hover { background: rgb(41, 182, 242); border: none; }' +
           '.geBtn button { min-width:72px !important; }' +
           'div.geToolbarContainer a.geButton { margin:2px; padding: 0 2px 4px 2px; } ' +
           '.geDialog, .mxWindow td.mxWindowPane *, div.geSprite, td.mxWindowTitle, .geDiagramContainer { box-sizing:content-box; }' +
           '.mxWindow div button.geStyleButton { box-sizing: border-box; }' +
           'html body #graph img { box-sizing: content-box; }' +
           'table.mxWindow td.mxWindowPane button.geColorBtn { padding:0px; box-sizing: border-box; }' +
           'td.mxWindowPane .geSidebarContainer button { padding:2px 0 2px 0; box-sizing: border-box; }' +
           // Fixes image path
           'html body .mxCellEditor { background: url(data:image/gif;base64,R0lGODlhMAAwAIAAAP///wAAACH5BAEAAAAALAAAAAAwADAAAAIxhI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6zvf+DwwKh8Si8egpAAA7) }' +
           // Make geItem look like a button
           '.geMenuItem { font-weight: 700; padding: 4px 10px; border: none; border-radius: 5px; color: #353535; box-shadow: inset 0 0 0 1px rgba(0,0,0,.11), inset 0 -1px 0 0 rgba(0,0,0,.08), 0 1px 2px 0 rgba(0,0,0,.04); }' +
           'a.geMenuItem:active { color: rgba(53, 53, 53, 0.35); }' +
           // CSS from index.html that overrides grapheditor
           '.geSidebarContainer .geTitle { color:#505050; } .geSidebarContainer .geTitle input {font-size:8pt;color:#606060;   }    .geBlock {z-index:-3;margin:100px; margin-top:40px; margin-bottom:30px;padding:20px;    }  ' +
           '.geBlock h1, .geBlock h2 {margin-top:0px;padding-top:0px;    }    .geEditor ::-webkit-scrollbar {width:12px;height:12px;    }    .geEditor ::-webkit-scrollbar-track { background:whiteSmoke;-webkit-box-shadow:inset 0 0 4px rgba(0,0,0,0.1);    }' +
           '.geEditor ::-webkit-scrollbar-thumb { background:#c5c5c5; border-radius:10px; border:whiteSmoke solid 3px;   }  .geEditor ::-webkit-scrollbar-thumb:hover { background:#b5b5b5;}  .geTemplate {   border:1px solid transparent;   display:inline-block;   _display:inline;    vertical-align:top; border-radius:3px;  overflow:hidden; font-size:14pt; cursor:pointer; margin:5px;}' +
           // Styling for Quip
           '.geToolbarContainer { background:#fff !important; }' +
           'div.mxWindow .geSidebarContainer .geTitle { background-color:#fdfdfd; }' +
           'div.mxWindow .geSidebarContainer .geTitle:hover { background-color:#fafafa; }' +
           'div.geSidebar { background-color: #fff !important;}' +
           'div.mxWindow td.mxWindowPane button { background-image: none; float: none; }' +
           'td.mxWindowTitle { height: 22px !important; background: none !important; font-size: 13px !important; text-align:center !important; border-bottom:1px solid lightgray; }' +
           'div.mxWindow, div.mxWindowTitle { background-image: none !important; background-color:#fff !important; }' +
           'div.mxWindow { border-radius:5px; box-shadow: 0px 0px 2px #C0C0C0 !important;}' +
           'div.mxWindow > img { padding: 4px !important;}' +
           'div.mxWindow * { font-family: inherit !important; }' +
           'html body .geHint a { color: #29b6f2; }' +
           // Quip Style UI
           'html div.geVerticalHandle { position:absolute;bottom:0px;left:50%;cursor:row-resize;width:11px;height:11px;background:white;margin-bottom:-6px; margin-left:-6px; border: none; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.11), inset 0 -1px 0 0 rgba(0,0,0,.08), 0 1px 2px 0 rgba(0,0,0,.04); }' +
           'html div.geInactivePage { background: rgb(249, 249, 249) !important; color:lightgray !important; } ' +
           'html div.geActivePage { background: white !important;color: #353535 !important; } ' +
           'html div.mxRubberband { border:1px solid; border-color: rgba(41,182,242,1) !important; background:rgba(41,182,242,0.4) !important; } ' +
           'html body div.mxPopupMenu { border-radius:5px; border:1px solid #c0c0c0; padding:5px 0 5px 0; box-shadow: 0px 4px 17px -4px rgba(96,96,96,1); background:#fff; } ' +
           'html table.mxPopupMenu td.mxPopupMenuItem { color: #353535; font-size: 14px; padding-top: 4px; padding-bottom: 4px; -webkit-font-smoothing: antialiased; font-family: "Salesforce Sans Web",sans-serif,"Quip Glyphs"; }' +
           'html table.mxPopupMenu tr.mxPopupMenuItemHover { background-color: #29b6f2; }' +
           'html tr.mxPopupMenuItemHover td.mxPopupMenuItem, html tr.mxPopupMenuItemHover td.mxPopupMenuItem span { color: #fff !important; }' +
           'html tr.mxPopupMenuItem, html td.mxPopupMenuItem { transition-property: none !important; }' +
           'html table.mxPopupMenu hr { height: 2px; background-color: rgba(0,0,0,.07); margin: 5px 0; }';
       document.getElementsByTagName('head')[0].appendChild(style);
    }
    catch (e)
    {
       // ignore
    }
})();

var tempParams = (function(url)
{
    var result = new Object();
    var idx = url.lastIndexOf('?');

    if (idx > 0)
    {
        var params = url.substring(idx + 1).split('&');
        
        for (var i = 0; i < params.length; i++)
        {
            idx = params[i].indexOf('=');
            
            if (idx > 0)
            {
                result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
            }
        }
    }
    
    return result;
})(window.location.href);

window.urlParams = {toolbar: '0', nav: '1', mode: 'device' /* cookie bypass */};
window.mxBasePath = '//' + domain + '/mxgraph/';
window.mxLoadSettings = false;
window.mxLoadStylesheets = false;
window.mxLanguage = tempParams['language_code'] || 'en';
window.SAVE_URL = '//' + domain + '/save';
window.OPEN_URL = '//' + domain + '/open';
window.PROXY_URL = '//' + domain + '/proxy';
window.RESOURCES_PATH = '//' + domain + '/resources';
window.RESOURCE_BASE = window.RESOURCE_BASE || RESOURCES_PATH + '/dia';
window.SHAPES_PATH = '//' + domain + '/shapes';
window.ICONSEARCH_PATH = '//' + domain + '/iconSearch';
window.STENCIL_PATH = '//' + domain + '/stencils';
window.TEMPLATE_PATH = '//' + domain + '/templates';
window.IMAGE_PATH = '//' + domain + '/images';
window.STYLE_PATH = '//' + domain + '/styles';
window.CSS_PATH = '//' + domain + '/styles';
window.OPEN_FORM = '//' + domain + '/open.html';
window.GRAPH_IMAGE_PATH = 'https://www.draw.io/img';

if (window.mxLanguage.indexOf('_') > 0)
{
    window.mxLanguage = window.mxLanguage.substring(0, window.mxLanguage.indexOf('_'));
}

var mxscript = function(src, onLoad)
{
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
  var r = false;
  
  if (onLoad != null)
  {
      s.onload = s.onreadystatechange = function()
      {
          if (!r && (!this.readyState || this.readyState == 'complete'))
          {
              r = true;
              onLoad();
          }
      };
  }
  
  document.body.appendChild(s);
};

window.mxscript = mxscript;

var revsListener = function(evt)
{
    if (ui != null && ui.session != null)
    {
        // Handles "merge" operation from advanced
        // dialog and multiple selected templates
        var entry = getData();
        
        if (entry != null && entry.data != null && ui.session.revisionId != entry.id)
        {
            debug('revision changed', entry);

            ui.session.ignoreNotify = true;
            ui.setFileData(entry.data);
            ui.session.revisionId = entry.id;
            ui.editor.undoManager.clear();
            ui.session.ignoreNotify = false;
                
            // Keeps only first template
            var revs = rootRecord.get('revisions');
            
            if (revs != null)
            {
                while (revs.count() > 1)
                {
                    revs.get(1).delete();
                }
            }
            
            ui.session.reset();
        }
    }
    else
    {
        initSession();
    }
};

var rootRecordListener = function(evt)
{
    if (preview != null)
    {
        var tempConfig = rootRecord.get("config");

        if (tempConfig != null && tempConfig.length > 0 && tempConfig != JSON.stringify(viewerConfig))
        {
            viewerConfig = JSON.parse(tempConfig);
            hidePreview();
        }
    }
    else if (ui != null)
    {
        // Keeps scratchpad in sync
        if (ui.scratchpad != null)
        {
            ui.getLocalData('.scratchpad', function(tmp)
            {
                if (tmp != null && tmp != ui.scratchpad.getData())
                {
                    ui.loadLibrary(new StorageLibrary(ui, tmp, '.scratchpad'));
                }
            });
        }
        
        ui.reloadFromRecord();
    }
};

var editsListener = function(evt)
{
    if (preview != null)
    {
        if (snapshotObj != null && snapshotObj.edits != rootRecord.get("edits").count())
        {
            hidePreview();
        }
    }
};

var onlineListener = function()
{
    if (ui == null)
    {
        return;
    }
    
    updateActions();
};

var focusListener = function()
{
    if (preview != null)
    {
        if (!ignoreFocus)
        {
            hidePreview();
        }
        else
        {
            quip.apps.enableResizing({maintainAspectRatio: true, minWidth: 100, minHeight: 100});
        }
        
        return;
    }
    else if (ui == null || (ui != null && ui.session == null && dlg == null))
    {
        return;
    }
    
    if (ui.vHandle != null)
    {
        ui.vHandle.style.display = (dlg == null) ? '' : 'none';
    }
    
    if (ui.sidebarWindow != null && sidebarWindowVisible)
    {
        ui.sidebarWindow.window.setVisible(sidebarWindowVisible);
        ui.sidebarWindow.window.fit();
    }
    
    if (ui.formatWindow != null && formatWindowVisible)
    {
        ui.formatWindow.window.setVisible(formatWindowVisible);
        ui.formatWindow.window.fit();
    }

    if (ui.actions.outlineWindow != null && outlineWindowVisible)
    {
        ui.actions.outlineWindow.window.setVisible(outlineWindowVisible);
        ui.actions.outlineWindow.window.fit();
    }

    if (ui.actions.layersWindow != null && layersWindowVisible)
    {
        ui.actions.layersWindow.window.setVisible(layersWindowVisible);
        ui.actions.layersWindow.window.fit();
    }

    if (ui.menus.tagsWindow != null && tagsWindowVisible)
    {
        ui.menus.tagsWindow.window.setVisible(tagsWindowVisible);
        ui.menus.tagsWindow.window.fit();
    }

    if (ui.menus.findWindow != null && findWindowVisible)
    {
        ui.menus.findWindow.window.setVisible(findWindowVisible);
        ui.menus.findWindow.window.fit();
    }
    
    if (gridVisible)
    {
        ui.actions.get('grid').funct();
    }

    updateBorder();
    
    if (pageVisible)
    {
        ui.actions.get('pageView').funct();
    }
};

var blurListener = function()
{
    if (ui == null || (ui != null && ui.session == null && dlg == null))
    {
        return;
    }
    
    if (fullscreen)
    {
        setFullscreen(false);
    }
    
    // Workaround for focus of container
    var prev = graph.cellEditor.focusContainer;
    graph.cellEditor.focusContainer = function() {};
    ui.editor.graph.stopEditing(false);
    graph.cellEditor.focusContainer = prev;

    if (ui.menus.findWindow != null)
    {
        findWindowVisible = ui.menus.findWindow.window.isVisible();
        ui.menus.findWindow.window.setVisible(false);
    }
    else
    {
        findWindowVisible = false;
    }
    
    if (ui.menus.tagsWindow != null)
    {
        tagsWindowVisible = ui.menus.tagsWindow.window.isVisible();
        ui.menus.tagsWindow.window.setVisible(false);
    }
    else
    {
        tagsWindowVisible = false;
    }
    
    if (ui.actions.layersWindow != null)
    {
        layersWindowVisible = ui.actions.layersWindow.window.isVisible();
        ui.actions.layersWindow.window.setVisible(false);
    }
    else
    {
        layersWindowVisible = false;
    }
    
    if (ui.actions.outlineWindow != null)
    {
        outlineWindowVisible = ui.actions.outlineWindow.window.isVisible();
        ui.actions.outlineWindow.window.setVisible(false);
    }
    else
    {
        outlineWindowVisible = false;
    }

    if (ui.formatWindow != null)
    {
        formatWindowVisible = ui.formatWindow.window.isVisible();
        ui.formatWindow.window.setVisible(false);
    }
    else
    {
        formatWindowVisible = false;
    }

    if (ui.sidebarWindow != null)
    {
        sidebarWindowVisible = ui.sidebarWindow.window.isVisible();
        ui.sidebarWindow.window.setVisible(false);
    }
    else
    {
        sidebarWindowVisible = false;
    }
    
    graph.popupMenuHandler.hideMenu();
    graph.clearSelection();
    ui.hideDialog();
    updateBorder();
    
    pageVisible = graph.pageVisible;

    if (pageVisible)
    {
        ui.actions.get('pageView').funct();
    }

    gridVisible = graph.isGridEnabled();
    
    if (gridVisible)
    {
        ui.actions.get('grid').funct();
    }
    
    if (ui.vHandle != null)
    {
        ui.vHandle.style.display = 'none';
    }
    
    ui.reloadFromRecord(true);
    
    if (!viewerConfig.noPreview)
    {
        updateSnapshot();
    }
};

var sizeListener = function()
{
    if (ui == null)
    {
        return;
    }

    clearSelection();
    fitDiagram();
};

var mouseLeaveListener = function()
{
    if (graph != null)
    {
        graph.connectionHandler.reset();
    }
    
    if (ui != null)
    {
        ui.hoverIcons.reset();
    }
};

var unloadHandler = function()
{
    if (ui != null)
    {
        ui.destroy();
        graph = null;
        ui = null;
    }
    
    if (rootRecord != null)
    {
        if (rootRecordListener != null)
        {
            rootRecord.unlisten(rootRecordListener);
            rootRecordListener = null;
        }
        
        var edits = rootRecord.get("edits");
        
        if (edits != null && editsListener != null)
        {
            edits.unlisten(editsListener);
            editsListener = null;
        }
        
        var revs = rootRecord.get("revisions");
        
        if (revs != null && revsListener != null)
        {
            revs.unlisten(revsListener);
            revsListener = null;
        }
        
        rootRecord = null;
    }
    
    if (container != null)
    {
        container.parentNode.removeChild(container);
        container = null;
    }

    if (mouseLeaveListener != null)
    {
        document.body.removeEventListener('mouseleave', mouseLeaveListener);
        mouseLeaveListener = null;
    }
    
    document.body.onselectstart = null;
};

var beforeUnloadHandler = function()
{
    if (quip.apps != null)
    {
      if (blurListener != null)
      {
          quip.apps.removeEventListener(quip.apps.EventType.ELEMENT_BLUR, blurListener);
          blurListener = null;
      }
      
      if (onlineListener != null)
      {
          quip.apps.removeEventListener(quip.apps.EventType.ONLINE_STATUS_CHANGED, onlineListener);
          onlineListener = null;
      }
      
      if (sizeListener != null)
      {
          quip.apps.removeEventListener(quip.apps.EventType.CONTAINER_SIZE_UPDATE, sizeListener);
          sizeListener = null;
      }
      
      if (focusListener != null)
      {
          quip.apps.removeEventListener(quip.apps.EventType.ELEMENT_FOCUS, focusListener);
          focusListener = null;
      }
    }
};

quip.apps.addEventListener(quip.apps.EventType.ELEMENT_BLUR, blurListener);
quip.apps.addEventListener(quip.apps.EventType.ONLINE_STATUS_CHANGED, onlineListener);
quip.apps.addEventListener(quip.apps.EventType.CONTAINER_SIZE_UPDATE, sizeListener);
quip.apps.addEventListener(quip.apps.EventType.ELEMENT_FOCUS, focusListener);
document.body.addEventListener('mouseleave', mouseLeaveListener);
window.addEventListener('beforeunload', beforeUnloadHandler);
window.addEventListener('unload', unloadHandler);

//Fixes text selection during resize
document.body.onselectstart = function(evt)
{
    if (evt == null)
    {
        evt = window.event;
    }
    
    // Checks for mxWindow event source
    var target = evt.target;
    
    while (target != null)
    {
        if (target.className == 'mxWindow')
        {
            return true;
        }
        
        target = target.parentNode;
    }
    
    return ui != null && graph != null && (ui.dialog != null || ui.isSelectionAllowed(evt) || graph.isEditing());
};

function debug()
{
    if (debugOutput)
    {
        console.log.apply(console, arguments);
    }
};

function guid()
{
  function s4()
  {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  
  return s4() + s4() + s4() + s4();
};

function clearSelection()
{
    if (window.getSelection)
    {
        if (window.getSelection().empty)
        {  // Chrome
            window.getSelection().empty();
        }
        else if (window.getSelection().removeAllRanges)
        {  // Firefox
            window.getSelection().removeAllRanges();
        }
     }
     else if (document.selection)
     {  // IE?
        document.selection.empty();
     }
};

function hidePreview(afterOnLoad)
{
    if (!hidingPreview)
    {
        hidingPreview = true;
        quip.apps.enableResizing({maintainAspectRatio: true, minWidth: 100, minHeight: 100});
        
        var img = document.createElement('img');
        img.style.cssText = 'position:absolute;left:0;top:0;width:12px;height:12px;z-index:1;';
        img.setAttribute('src', spinImage);
        preview.appendChild(img);

        // Workaround for async loading of JS resources in production
        if (window.EditorUi == null)
        {
            var prev = window.mxIntegrateCallback;
            
            window.mxIntegrateCallback = function()
            {
                if (prev != null)
                {
                    prev();
                }
    
                createViewer(true, null, onload);
            };
        }
        else
        {
            createViewer(true, null, onload);
        }
    }
};

function isDocumentEditable()
{
    return quip.apps.isDocumentEditable() && !locked && !isReadOnlyMode();
};

function isDocumentTemplate()
{
    return quip.apps.isExplorerTemplate != null && quip.apps.isExplorerTemplate();  
};

function saveDocument()
{
    setData(ui.getFileData(null, null, null, null, null, null, null, true));
    updateBorder();
};

function setFullscreen(value, noFade)
{
    graph.popupMenuHandler.hideMenu();
    
    if (!fullscreen && value)
    {
        fullscreen = value;

        if (ui.vHandle != null)
        {
            ui.vHandle.style.display = 'none';
        }
  
        var menubar = document.createElement('div');
        menubar.style.cssText = 'position:absolute;left:0px;right:0px;top:0px;height:44px;padding:' +
            (((mxClient.IS_GC && mxClient.IS_MAC) || mxClient.IS_SF) ? 3 : 7) +
            'px;border-bottom:1px solid lightgray;background-color:#ffffff;text-align:center;';
        
        var menuObj = new Menubar(ui, menubar);
        
        function addMenu(id, small)
        {
            var menu = ui.menus.get(id);
            
            var elt = menuObj.addMenu(mxResources.get(id), mxUtils.bind(this, function()
            {
                // Allows extensions of menu.functid
                menu.funct.apply(this, arguments);
            }));
            
            elt.className = 'geMenuItem';
            elt.style.position = 'relative';
            elt.style.fontWeight = 'normal';
            elt.style.top = '6px';
            elt.style.marginRight = '6px';
            elt.style.height = '30px';
            elt.style.paddingTop = '6px';
            elt.style.paddingBottom = '6px';
            ui.menus.menuCreated(menu, elt);
            
            if (!small)
            {
                elt.innerHTML += '<img style="margin-left:2px;margin-top:-2px;" height="10" src="' + mxWindow.prototype.normalizeImage + '"/>';
            }
                        
            return elt;
        };
        
        function addMenuItem(label, fn, small, tooltip, action, defaultOpacity)
        {
            var btn = document.createElement('a');
            btn.setAttribute('href', 'javascript:void(0)');
            mxUtils.write(btn, label);
            btn.className = 'geMenuItem';
            btn.style.position = 'relative';
            btn.style.fontWeight = 'normal';
            btn.style.top = '6px';
            btn.style.height = '30px';
            btn.style.paddingTop = '6px';
            btn.style.paddingBottom = '6px';
            menubar.appendChild(btn);
            
            mxEvent.addListener(btn, 'click', function(evt)
            {
                fn();
                mxEvent.consume(evt);
            });
            
            if (small != null)
            {
                btn.style.minWidth = '30px';
                btn.style.marginRight = '-1px';
            }
            else
            {
                btn.style.marginRight = '5px';
            }
            
            if (tooltip != null)
            {
                btn.setAttribute('title', tooltip);
            }
            
            if (action != null)
            {
                defaultOpacity = (defaultOpacity != null) ? defaultOpacity : 1;
                btn.style.opacity = defaultOpacity;
                
                function updateState()
                {
                    if (action.isEnabled())
                    {
                        btn.removeAttribute('disabled');
                        btn.style.opacity = defaultOpacity;
                    }
                    else
                    {
                        btn.setAttribute('disabled', 'disabled');
                        btn.style.opacity = defaultOpacity - 0.5;
                    }
                };
                
                action.addListener('stateChanged', updateState);
                updateState();
            }

            return btn;
        };
        
        function createGroup(btns)
        {
            var btnGroup = document.createElement('span');
            btnGroup.className = 'geMenuItem';
            btnGroup.style.display = 'inline-block';
            btnGroup.style.marginRight = '6px';
            btnGroup.style.padding = '0px';
            btnGroup.style.height = '30px';
            
            for (var i = 0; i < btns.length; i++)
            {
                btns[i].style.margin = '0px';
                btns[i].style.boxShadow = 'none';
                btnGroup.appendChild(btns[i]);    
            }

            menubar.appendChild(btnGroup);
            
            return btnGroup;
        };
        
        addMenu('diagram');

        if (isDocumentEditable())
        {
            createGroup([addMenuItem(mxResources.get('shapes'), toggleShapes),
                         addMenuItem(mxResources.get('format'), toggleFormat)]);
            createGroup([addMenu('insert', true), addMenuItem(mxResources.get('delete'), doDelete)]);
            var btns = [addMenuItem('', ui.actions.get('undo').funct, null, null, ui.actions.get('undo'), 0.7),
                        addMenuItem('', ui.actions.get('redo').funct, null, null, ui.actions.get('redo'), 0.7)];
            
            btns[0].innerHTML = '<img height="20" style="margin-top:-2px;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIuNSA4Yy0yLjY1IDAtNS4wNS45OS02LjkgMi42TDIgN3Y5aDlsLTMuNjItMy42MmMxLjM5LTEuMTYgMy4xNi0xLjg4IDUuMTItMS44OCAzLjU0IDAgNi41NSAyLjMxIDcuNiA1LjVsMi4zNy0uNzhDMjEuMDggMTEuMDMgMTcuMTUgOCAxMi41IDh6Ii8+PC9zdmc+"/>';
            btns[1].innerHTML = '<img height="20" style="margin-top:-2px;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTguNCAxMC42QzE2LjU1IDguOTkgMTQuMTUgOCAxMS41IDhjLTQuNjUgMC04LjU4IDMuMDMtOS45NiA3LjIyTDMuOSAxNmMxLjA1LTMuMTkgNC4wNS01LjUgNy42LTUuNSAxLjk1IDAgMy43My43MiA1LjEyIDEuODhMMTMgMTZoOVY3bC0zLjYgMy42eiIvPjwvc3ZnPg=="/>';

            createGroup(btns);
        }
        
        var btns = [addMenuItem(mxResources.get('fit'), function()
        {
            graph.popupMenuHandler.hideMenu();
            var scale = graph.view.scale;
            var tx = graph.view.translate.x;
            var ty = graph.view.translate.y;
            
            fitDiagram(true, true);
            
            // Toggle scale if nothing has changed
            if (Math.abs(scale - graph.view.scale) < 0.00001 && tx == graph.view.translate.x && ty == graph.view.translate.y)
            {
                graph.fit(60, null, null, null, null, true);
                ui.chromelessResize(null, null, null, null, true);
            }
        }, true),
        addMenuItem('', ui.actions.get('zoomIn').funct, true, mxResources.get('zoomIn')),
        addMenuItem('', ui.actions.get('zoomOut').funct, true, mxResources.get('zoomOut'))];

        btns[0].innerHTML = '<img height="20" style="opacity:0.7;margin-top:-2px;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA1djRoMlY1aDRWM0g1Yy0xLjEgMC0yIC45LTIgMnptMiAxMEgzdjRjMCAxLjEuOSAyIDIgMmg0di0ySDV2LTR6bTE0IDRoLTR2Mmg0YzEuMSAwIDItLjkgMi0ydi00aC0ydjR6bTAtMTZoLTR2Mmg0djRoMlY1YzAtMS4xLS45LTItMi0yeiIvPjwvc3ZnPg=="/>';
        btns[1].innerHTML = '<img height="20" style="opacity:0.7;margin-top:-2px;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTUuNSAxNGgtLjc5bC0uMjgtLjI3QzE1LjQxIDEyLjU5IDE2IDExLjExIDE2IDkuNSAxNiA1LjkxIDEzLjA5IDMgOS41IDNTMyA1LjkxIDMgOS41IDUuOTEgMTYgOS41IDE2YzEuNjEgMCAzLjA5LS41OSA0LjIzLTEuNTdsLjI3LjI4di43OWw1IDQuOTlMMjAuNDkgMTlsLTQuOTktNXptLTYgMEM3LjAxIDE0IDUgMTEuOTkgNSA5LjVTNy4wMSA1IDkuNSA1IDE0IDcuMDEgMTQgOS41IDExLjk5IDE0IDkuNSAxNHptMi41LTRoLTJ2Mkg5di0ySDdWOWgyVjdoMXYyaDJ2MXoiLz48L3N2Zz4="/>';
        btns[2].innerHTML = '<img height="20" style="opacity:0.7;margin-top:-2px;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTUuNSAxNGgtLjc5bC0uMjgtLjI3QzE1LjQxIDEyLjU5IDE2IDExLjExIDE2IDkuNSAxNiA1LjkxIDEzLjA5IDMgOS41IDNTMyA1LjkxIDMgOS41IDUuOTEgMTYgOS41IDE2YzEuNjEgMCAzLjA5LS41OSA0LjIzLTEuNTdsLjI3LjI4di43OWw1IDQuOTlMMjAuNDkgMTlsLTQuOTktNXptLTYgMEM3LjAxIDE0IDUgMTEuOTkgNSA5LjVTNy4wMSA1IDkuNSA1IDE0IDcuMDEgMTQgOS41IDExLjk5IDE0IDkuNSAxNHpNNyA5aDV2MUg3eiIvPjwvc3ZnPg=="/>';
        
        createGroup(btns);
        
        if (!isReadOnlyMode())
        {
            var btn = addMenuItem((locked) ? '🔓' :
                // Newline required for code formatter to show unicode symbol
                '🔐', ui.actions.get('lockApp').funct);
            btn.style.paddingRight = '4px';
            btn.style.minWidth = '';
        }

        var btn = addMenuItem(mxResources.get('done'), function()
        {
            setFullscreen(false);
        });
        
        btn.className += ' gePrimaryBtn';
        btn.style.fontWeight = '';
        
        quip.apps.showBackdrop(function()
        {
            setFullscreen(false);
        });

        // Workaround for too large diagram problem in fullscreen
        quip.apps.setWidthAndAspectRatio(1, 0);

        ui.tabContainer = document.createElement('div');
        ui.tabContainer.setAttribute('id', 'theTabContainer');
        ui.tabContainer.style.cssText = 'position:absolute;left:0px;right:0px;bottom:0px;height:' + ui.tabContainerHeight + 'px;' +
            'background:#fff;border-top:1px solid lightgray;margin-left:-2px;';
        
        previousParent = container.parentNode;
        container.style.height = '';
        container.style.minWidth = '100%';
        container.style.minHeight = '100%';

        var dim = quip.apps.getViewportDimensions();
        var rect = quip.apps.getBoundingClientRect();
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:' + (-rect.top) + 'px;left:' + (-rect.left) + 'px;overflow:hidden;' +
        	'height:' + dim.height + 'px;width:' + dim.width + 'px;padding-top:44px;border-top:1px solid lightgray;padding-bottom:' +
            ui.tabContainerHeight + 'px;z-index:' + minZIndex;
        
        wrapper.appendChild(ui.tabContainer);
        wrapper.appendChild(menubar);
        wrapper.appendChild(container);
        previousParent.appendChild(wrapper);

        quip.apps.disableResizing();
        ui.updateTabContainer();
        fitDiagram(true);
        updateBorder();
        
        // Workaround for no resize event for viewport
        function checkSize()
        {
            var dim = quip.apps.getViewportDimensions();
            var rect = quip.apps.getBoundingClientRect();
            
            wrapper.style.top = (-rect.top) + 'px';
            wrapper.style.left = (-rect.left) + 'px';
            wrapper.style.width = dim.width + 'px';
            wrapper.style.height = dim.height + 'px';
        };
        
        mxEvent.addListener(wrapper, 'mouseenter', checkSize);
        mxEvent.addListener(wrapper, 'click', checkSize);
        
        // Checks for escape keystroke when menubar is focused
        mxEvent.addListener(menubar, 'keydown', function(evt)
        {
            if (evt.keyCode == 27)
            {
                setFullscreen(false);
            }
        });
    }
    else if (fullscreen && !value)
    {
        fullscreen = value;
        quip.apps.dismissBackdrop();
      
        container.style.minWidth = '';
        container.style.minHeight = '';

        if (ui.vHandle != null && dlg == null)
        {
            ui.vHandle.style.display = '';
        }
        
        var wrapper = container.parentNode;
        wrapper.parentNode.removeChild(wrapper);
        previousParent.appendChild(container);
        
        quip.apps.enableResizing({maintainAspectRatio: true, minWidth: 100, minHeight: 100});
        fitDiagram(true);
        updateBorder();
    }
    
    // Resets existing viewstates
    if (ui.pages != null)
    {
        for (var i = 0; i < ui.pages.length; i++)
        {
            ui.pages[i].viewState = null;
        }
    }

    // Fade in
    if (!noFade)
    {
        container.style.opacity = '0';
        
        window.setTimeout(function()
        {
            mxUtils.setPrefixedStyle(container.style, 'transition', 'all 0.3s linear');
            container.style.opacity = '1';
            
            window.setTimeout(function()
            {
                mxUtils.setPrefixedStyle(container.style, 'transition', null);
            }, 300);
        }, 30);
    }
    else
    {
        container.style.opacity = '';
    }
};

var lastWidth = 0;
var theThread = null;

function fitDiagram(force, immediate)
{
    if (ui == null)
    {
        return;
    }
    
    var w = quip.apps.getContainerWidth();

    if (dlg != null)
    {
        quip.apps.setWidthAndAspectRatio(w, defaultHeight / w);
    }
    else if (ui.isDiagramEmpty() && !graph.pageVisible)
    {
        graph.view.scaleAndTranslate((viewerConfig.fixedZoom) ? viewerConfig.maxZoom : 1, 20, 20);
        
        if (!fullscreen)
        {
            quip.apps.setWidthAndAspectRatio(w, blankHeight / w);
            container.style.height = blankHeight + 'px';
            graph.container.style.overflow = 'hidden';
        }
    }
    else
    {
        if (theThread != null)
        {
            window.clearTimeout(theThread);
        }
        
        var fn = function()
        {
            if (ui == null)
            {
                return;
            }
            
            if (ui.isDiagramEmpty() && !graph.pageVisible)
            {
                graph.view.scaleAndTranslate((viewerConfig.fixedZoom) ? viewerConfig.maxZoom : 1, 20, 20);
                
                if (!fullscreen)
                {
                    quip.apps.setWidthAndAspectRatio(w, blankHeight / w);
                    container.style.height = blankHeight + 'px';
                    graph.container.style.overflow = 'hidden';
                }
            }
            else
            {
                if (!fullscreen && viewerConfig.fixedZoom)
                {
                    graph.zoomTo(viewerConfig.maxZoom);
                }
                else
                {
                    if (force || w != lastWidth)
                    {
                        lastWidth = w;
        
                        if (graph.pageVisible)
                        {
                            var fullscreenPadding = 40;
                            var cw = (fullscreen) ? container.clientWidth - fullscreenPadding : quip.apps.getContainerWidth() - 2 * padding;
                            var pb = graph.view.getBackgroundPageBounds();
                            var scale = cw / (pb.width / graph.view.scale);
                            
                            if (fullscreen)
                            {
                                scale = Math.min(scale, (container.clientHeight - fullscreenPadding) / (pb.height / graph.view.scale));
                            }
                            
                            graph.zoomTo(scale);
                        }
                        else
                        {
                            ui.lightboxFit();
                        }
                    }
                }
    
                // Adjust height of container
                if (!fullscreen)
                {
                    var bounds2 = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
                    var h = Math.max(50, Math.ceil(bounds2.height + Math.max(2, 2 * Math.max(1, padding + 2) - 2)));
                    quip.apps.setWidthAndAspectRatio(w, h / w);
                    container.style.height = h + 'px';
                }
    
                graph.container.style.overflow = (!isDocumentEditable() || quip.apps.isMobile() || 
                        (!fullscreen && viewerConfig.fixedZoom)) ? 'auto' : 'hidden';
                ui.chromelessResize();
            }
        };
        
        if (immediate)
        {
            fn();
        }
        else
        {
            theThread = window.setTimeout(fn, 30);
        }
    }
};

function updateContainerSize()
{
    if (ui.isDiagramEmpty())
    {
        fitDiagram(true);
    }
    else if (!fullscreen)
    {
        // Increases height for added content
        var bounds = quip.apps.getCurrentDimensions();
        var bounds2 = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
        var h = Math.max(50, Math.ceil(bounds2.height + bounds2.y + padding + 2));
        
        if (bounds.height < h)
        {
            // KNWON: If scrollbars are added this triggers fitDiagram asynchonously
            quip.apps.setWidthAndAspectRatio(bounds.width, h / bounds.width);
            container.style.height = h + 'px';
        }
    }
};

function setData(data)
{
    var user = quip.apps.getViewingUser();
    var entry = {"id": sessionId + '-' + (revCounter++), "timestamp": new Date().getTime(),
        "username": user.getName(), "userid": user.getId(), "data": data};

    if (!isDocumentTemplate())
    {
        rootRecord.get("revisions").add({data: JSON.stringify(entry)});
        debug('revision added', entry.id);
        
        // Clears old file format
        if (deleteData)
        {
            rootRecord.clear("data");
            deleteData = false;
        }
    }
    
    return entry;
};

// CheckLast is used to load the last revision if it has a lastEdit property
function getData(checkLast)
{
    var revs = rootRecord.get("revisions");
    
    if (revs != null && revs.count() > 0)
    {
        if (revs.length > 1 && checkLast)
        {
            var temp = revs.get(revs.count() - 1).get("data");
            
            if (temp != null && temp.length > 0)
            {
                var entry = JSON.parse(temp);
                
                if (entry.lastEdit != null && entry.lastEdit != '')
                {
                    return entry;
                }
            }
        }
        
        var temp = revs.get(0).get("data");
        
        if (temp != null && temp.length > 0)
        {
            var entry = JSON.parse(temp);
            
            return entry;
        }
    }
    else
    {
        // Reads old file format
        var temp = rootRecord.get("data");
        
        if (temp != null && temp.length > 0)
        {
            var entry = JSON.parse(temp);
            deleteData = true;
            
            return entry;
        }
    }
    
    return null;
};

function setConfig(maxZoom, brd, fixedZoom, padd, noPreview)
{
    viewerConfig.maxZoom = Math.max(0.1, maxZoom);
    viewerConfig.border = Math.max(0, brd);
    viewerConfig.padding = Math.max(0, parseInt(padd));
    viewerConfig.locked = (viewerConfig.locked != null) ? viewerConfig.locked : false;
    viewerConfig.noPreview = noPreview;
    viewerConfig.fixedZoom = fixedZoom;
    
    ui.initialConfig = JSON.stringify(viewerConfig);
    
    if (!isDocumentTemplate())
    {
        rootRecord.set("config", ui.initialConfig);
    }
    
    border = viewerConfig.border;
    padding = viewerConfig.padding;
    fitDiagram(true);

    if (!viewerConfig.noPreview)
    {
        updateSnapshot();
    }
    else if (rootRecord.get("snapshot") != null)
    {
        debug('clear snapshot', rootRecord.getId());
        rootRecord.clear('snapshot');
    }
};

function showConfigureDialog()
{
    var div = document.createElement('div');
    div.style.textAlign = 'center';
    div.style.whiteSpace = 'nowrap';
    
    var tempConfig = rootRecord.get("config");
    var config = {};
    
    if (tempConfig != null && tempConfig.length > 0)
    {
        config = JSON.parse(tempConfig);
    }
    
    mxUtils.write(div, mxResources.get('zoom') + ':');
    var zoomInput = document.createElement('input');
    zoomInput.setAttribute('type', 'text');
    zoomInput.style.marginRight = '16px';
    zoomInput.style.width = '70px';
    zoomInput.style.marginLeft = '10px';
    zoomInput.style.marginRight = '12px';
    zoomInput.style.marginBottom = '8px';
    zoomInput.value = ((config.maxZoom != null) ? config.maxZoom : defaultMaxZoom) * 100 + '%';
    div.appendChild(zoomInput);
    
    var maxRadio = document.createElement('input');
    maxRadio.setAttribute('type', 'radio');
    maxRadio.setAttribute('name', 'zoomType');
    maxRadio.setAttribute('value', 'max');
    maxRadio.style.marginRight = '4px';
    div.appendChild(maxRadio);
    mxUtils.write(div, 'Max');
    
    var fixedRadio = document.createElement('input');
    fixedRadio.setAttribute('type', 'radio');
    fixedRadio.setAttribute('name', 'zoomType');
    fixedRadio.setAttribute('value', 'fixed');
    fixedRadio.style.marginRight = '4px';
    fixedRadio.style.marginLeft = '10px';
    div.appendChild(fixedRadio);
    mxUtils.write(div, 'Fixed');
    
    if (config.fixedZoom)
    {
        fixedRadio.defaultChecked = true;
        fixedRadio.checked = true;
    }
    else
    {
        maxRadio.defaultChecked = true;
        maxRadio.checked = true;
    }
    
    mxUtils.br(div);
    mxUtils.write(div, 'Padding:');
    var paddingInput = document.createElement('input');
    paddingInput.setAttribute('type', 'text');
    paddingInput.style.marginRight = '16px';
    paddingInput.style.width = '50px';
    paddingInput.style.marginTop = '10px';
    paddingInput.style.marginLeft = '10px';
    paddingInput.style.marginRight = '12px';
    paddingInput.value = padding;
    div.appendChild(paddingInput);
    
    var borderChk = ui.addCheckbox(div, 'Border', border > 0, null, true);
    
    mxUtils.br(div);
    var noPreviewChk = ui.addCheckbox(div, 'Enable caching', !viewerConfig.noPreview);
    noPreviewChk.style.marginTop = '24px';
    noPreviewChk.style.marginBottom = '20px';
    
    if (quip.apps.isViewerSiteAdmin())
    {
	    var btns = document.createElement('span');
	    var btn = mxUtils.button(mxResources.get('advanced'), function()
	    {
	    	function fn()
	    	{
				ui.hideDialog();
	        	showAdvancedDialog();
	    	};
	    	
	    	if (Editor.config != null && Editor.config.password != null)
	    	{
	    	    var dlg = new FilenameDialog(ui, '', mxResources.get('ok'), function(value)
	            {
	            	if (value == Editor.config.password)
	            	{
	            		fn();
	            	}
	            	else if (value != null)
	            	{
	            		ui.alert('Access denied');
	            	}
	            }, 'Enter password');
	            ui.showDialog(dlg.container, 300, 80, true, true);
	            dlg.init();
			}
			else
			{
				fn();
			}
	    });
	    btn.className = 'geBtn';
	    btns.appendChild(btn);
	}
    
    var btn2 = mxUtils.button(mxResources.get('help'), function()
    {
        quip.apps.openLink('https://desk.draw.io/support/solutions/articles/16000075766');
    });
    btn2.className = 'geBtn';
    btns.appendChild(btn2);
    
    var info = document.createElement('div');
    info.style.cssText = 'color:gray;text-align:center;left:0px;right:0px;font-size:11px;margin-top:2px;margin-bottom:28px;';
    var revs = rootRecord.get("revisions");
    var bytes = 0;
    
    for (var i = 0; i < revs.count(); i++)
    {
        bytes += revs.get(i).get("data").length;
    }
    
    mxUtils.write(info, ((bytes == 0) ? '0 kB' : ui.formatFileSize(bytes)) + ' in ' + revs.count() + ' initial state(s), ');
    
    var edits = rootRecord.get("edits");
    bytes = 0;
    
    for (var i = 0; i < edits.count(); i++)
    {
        bytes += edits.get(i).get("data").length;
    }
    
    mxUtils.write(info, ((bytes == 0) ? '0 kB' : ui.formatFileSize(bytes)) + ' in ' + edits.count() + ' edit(s)');
    mxUtils.br(info);
    
    var link = document.createElement('a');
    link.setAttribute('href', 'javascript:void(0)');
    link.style.cssText = 'color:rgb(41, 182, 242);font-size:11px;padding-right:8px;';
    mxUtils.write(link, 'Compress'); //mxResources.get('reset'));
    info.appendChild(link);
    div.appendChild(info);
    
    mxEvent.addListener(link, 'click', function(evt)
    {
        ui.hideDialog();
        
        ui.confirm('Compress diagram history?', null, function()
        {
            ui.hideDialog();

            // Deletes all edits
            var edits = rootRecord.get('edits');
            
            while (edits.count() > 0)
            {
                edits.get(0).delete();
            }
            
            // Saves current state and deletes old revisions
            saveDocument();
            cleanupRevisions();

            if (!viewerConfig.noPreview)
            {
                updateSnapshot();
            }
            else if (rootRecord.get("snapshot") != null)
            {
                debug('clear snapshot', rootRecord.getId());
                rootRecord.clear('snapshot');
            }
        }, mxResources.get('cancel'), 'Compress'); //mxResources.get('reset'));
        
        mxEvent.consume(evt);
    });
    
    var link = document.createElement('a');
    link.setAttribute('href', 'javascript:void(0)');
    link.style.cssText = 'color:rgb(41, 182, 242);font-size:11px;';
    mxUtils.write(link, mxResources.get('export'));
    info.appendChild(link);
    div.appendChild(info);
    
    mxEvent.addListener(link, 'click', function(evt)
    {
        ui.hideDialog();
        
        function getDataObjArray(record, compressData)
        {
            var result = [];
            
            for (var i = 0; i < record.count(); i++)
            {
                result.push(JSON.parse(record.get(i).get("data")));
            }
            
            return result;
        };

        var user = quip.apps.getViewingUser();
        var data = JSON.stringify({user: user.getId(),
        	domain: document.referrer,
            record: rootRecord.getId(),
            timestamp: new Date().getTime(),
            storage: rootRecord.get("storage"),
            config: rootRecord.get("config"),
            current: ui.getFileData(null, null, null, null, null, null, null, true),
            revisions: getDataObjArray(rootRecord.get("revisions")),
            edits: Graph.compress(JSON.stringify(getDataObjArray(rootRecord.get("edits"))))});
        ui.saveLocalFile(data, 'export-' + new Date().getTime() + '.txt', 'text/plain', false, 'txt');
        
        mxEvent.consume(evt);
    });

    var dlg = new CustomDialog(ui, div, function()
    {
        setConfig(parseInt(zoomInput.value) / 100, (borderChk.checked) ? 1 : 0,
                fixedRadio.checked, paddingInput.value, !noPreviewChk.checked);
    }, null, mxResources.get('apply'), null, btns);
    ui.showDialog(dlg.container, 366, 220, true, true);
    zoomInput.focus();
    
    if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS)
    {
        zoomInput.select();
    }
    else
    {
        document.execCommand('selectAll', false, null);
    }
};

function showAdvancedDialog(currentConfig)
{
    var config = (currentConfig != null) ? currentConfig : (quip.apps.getSitePreferences().getForKey('configuration') || defaultConfig);
    
    var dlg = new TextareaDialog(ui, 'Site Configuration', config, function(newValue)
    {
        if (newValue.length > 10000)
        {
            ui.alert('Too large (' + newValue.length + ' of 10 kB used)', function()
            {
                showAdvancedDialog(newValue);
            });
        }
        else
        {
            quip.apps.getSitePreferences().save({'configuration': newValue});
            ui.alert(mxResources.get('restartForChangeRequired'));
        }
    }, null, null, 420, 220, function(td)
    {
        td.style.textAlign = 'right';
        
        var helpBtn = mxUtils.button(mxResources.get('help'), function()
        {
            quip.apps.openLink('https://desk.draw.io/support/solutions/articles/16000058316');
        });
        
        helpBtn.className = 'geBtn';    
        td.appendChild(helpBtn);
        
        var resetBtn = mxUtils.button(mxResources.get('reset'), function()
        {
            ui.confirm('Reset site preferences?', function()
            {
                quip.apps.getSitePreferences().save({'configuration': null});
                quip.apps.getUserPreferences().save({'settings': null});
                ui.hideDialog();
                ui.alert(mxResources.get('restartForChangeRequired'));
            });
        });
        
        resetBtn.className = 'geBtn';    
        td.appendChild(resetBtn);

        var info = document.createElement('div');
        info.style.cssText = 'position:absolute;bottom:20px;color:gray;text-align:center;left:0px;right:0px;font-size:10px;';
        mxUtils.write(info, ((config.length == 0) ? '0 kB' : ui.formatFileSize(config.length)) + ' config');
        td.appendChild(info);
    });
    ui.showDialog(dlg.container, 440, 300, true, true);
    dlg.init();
};

function doDelete()
{
    if (graph.isSelectionEmpty() && ui.pages != null && ui.currentPage != null)
    {
        ui.hideDialog();
        
        ui.confirm(mxResources.get('removeIt', [mxResources.get('page')]) + '?', function()
        {
            ui.removePage(ui.currentPage);
            updateActions();
            fitDiagram();
        });
    }
    else
    {
        ui.actions.get('delete').funct();
    }
};

function toggleFormat()
{
    graph.popupMenuHandler.hideMenu();
    var rect = quip.apps.getBoundingClientRect();
    
    if (ui.formatWindow == null)
    {
        ui.formatWindow = new WrapperWindow(ui, mxResources.get('format'),
           Math.max(0, (fullscreen) ? container.clientWidth - ui.formatWidth - 27 : rect.left + container.clientWidth + 8),
           (fullscreen) ? 7 : 0, ui.formatWidth, 546, function(container)
        {
            var format = ui.createFormat(container);
            format.init();
            
            return format;
        });
        ui.formatWindow.window.addListener('show', function()
        {
            ui.fireEvent(new mxEventObject('format'));
        });
        ui.formatWindow.window.addListener('format', function()
        {
            ui.fireEvent(new mxEventObject('format'));
        });
        ui.formatWindow.window.minimumSize = new mxRectangle(0, 0, ui.formatWidth, 80);
        ui.formatWindow.window.setVisible(true);
        ui.formatWindow.window.fit();
        ui.fireEvent(new mxEventObject('sidebar'));
    }
    else
    {
        ui.formatWindow.window.setVisible(!ui.formatWindow.window.isVisible());

        if (ui.formatWindow.window.isVisible())
        {
            ui.formatWindow.window.fit();
        }
    }

    var offset = mxUtils.getOffset(ui.container);
    ui.formatWindow.window.div.style.top = Math.max(parseInt(ui.formatWindow.window.div.style.top),
            offset.y - ((fullscreen) ? 0 : rect.top)) + 'px';
};

function toggleShapes()
{
    graph.popupMenuHandler.hideMenu();
    var rect = quip.apps.getBoundingClientRect();

    if (ui.sidebarWindow == null)
    {
        var w = (fullscreen) ? 310 : Math.max(214, Math.min(310, rect.left));
        
        ui.sidebarWindow = new WrapperWindow(ui, mxResources.get('shapes'),
           (fullscreen) ? 10 : Math.max(0, rect.left - w), (fullscreen) ? 7 : 30,
           w - 6, Math.min((fullscreen) ? graph.container.clientHeight - 20 : 640,
           Math.max(container.clientHeight - 28, 420)),
           function(container)
        {
            var div = document.createElement('div');
            div.style.cssText = 'position:absolute;left:0px;right:0px;border-top:1px solid lightgray;' +
                'height:30px;bottom:31px;text-align:center;cursor:pointer;padding:0px;';
            div.className = 'geTitle';
            var span = document.createElement('span');
            span.style.cssText = 'position:relative;top:8px;';
            mxUtils.write(span, mxResources.get('moreShapes') + '...');
            div.appendChild(span);
            container.appendChild(div);
            
            mxEvent.addListener(div, 'click', function()
            {
                ui.actions.get('shapes').funct();
            });
            
            var div = document.createElement('div');
            div.style.cssText = 'position:absolute;left:0px;width:33%;border-top:1px solid lightgray;' +
                'height:30px;bottom:0px;text-align:center;cursor:pointer;padding:0px;';
            div.className = 'geTitle';
            var span = document.createElement('span');
            span.style.cssText = 'position:relative;top:6px;';
            mxUtils.write(span, mxResources.get('new') + '...');
            div.appendChild(span);
            container.appendChild(div);
            
            mxEvent.addListener(div, 'click', function()
            {
                ui.showLibraryDialog(null, null, null, null, 'device');
            });

            var div = document.createElement('div');
            div.style.cssText = 'position:absolute;left:33%;width:33%;border-top:1px solid lightgray;' +
                'height:30px;bottom:0px;text-align:center;cursor:pointer;padding:0px;border-left: 1px solid lightgray;';
            div.className = 'geTitle';
            var span = document.createElement('span');
            span.style.cssText = 'position:relative;top:6px;';
            mxUtils.write(span, mxResources.get('open') + '...');
            div.appendChild(span);
            container.appendChild(div);
            
            mxEvent.addListener(div, 'click', function()
            {
                ui.pickLibrary('device');
            });
            
            var div = document.createElement('div');
            div.style.cssText = 'position:absolute;right:0px;width:33%;border-top:1px solid lightgray;' +
                'height:30px;bottom:0px;text-align:center;cursor:pointer;padding:0px;border-left: 1px solid lightgray;';
            div.className = 'geTitle';
            var span = document.createElement('span');
            span.style.cssText = 'position:relative;top:6px;';
            mxUtils.write(span, mxResources.get('url') + '...');
            div.appendChild(span);
            container.appendChild(div);

            mxEvent.addListener(div, 'click', function()
            {
                // TODO: Store custom libraries with data in record or allow connect-src *.quip.com for shared libs
                var dlg = new FilenameDialog(ui, '', mxResources.get('open'), function(fileUrl)
                {
                    if (fileUrl != null && fileUrl.length > 0 && ui.spinner.spin(document.body, mxResources.get('loading')))
                    {
                        var realUrl = fileUrl;
                        
                        if (!ui.editor.isCorsEnabledForUrl(fileUrl))
                        {
                            realUrl = PROXY_URL + '?url=' + encodeURIComponent(fileUrl);
                        }
                        
                        // Uses proxy to avoid CORS issues
                        mxUtils.get(realUrl, function(req)
                        {
                            if (req.getStatus() >= 200 && req.getStatus() <= 299)
                            {
                                ui.spinner.stop();
                                
                                try
                                {
                                    ui.loadLibrary(new UrlLibrary(this, req.getText(), fileUrl));
                                }
                                catch (e)
                                {
                                    ui.handleError(e, mxResources.get('errorLoadingFile'));
                                }
                            }
                            else
                            {
                                ui.spinner.stop();
                                ui.handleError(null, mxResources.get('errorLoadingFile'));
                            }
                        }, function()
                        {
                            ui.spinner.stop();
                            ui.handleError(null, mxResources.get('errorLoadingFile'));
                        });
                    }
                }, mxResources.get('fromUrl'));
                ui.showDialog(dlg.container, 300, 80, true, true);
                dlg.init();
            });
            
            ui.toggleScratchpad();
            container.appendChild(ui.sidebar.container);
            container.style.overflow = 'hidden';
            
            return container;
        });
        ui.sidebarWindow.window.addListener('show', function()
        {
            ui.fireEvent(new mxEventObject('sidebar'));
        });
        ui.sidebarWindow.window.addListener('sidebar', function()
        {
            ui.fireEvent(new mxEventObject('sidebar'));
        });
        ui.sidebarWindow.window.minimumSize = new mxRectangle(0, 0, 90, 90);
        ui.sidebarWindow.window.setVisible(true);
        ui.sidebarWindow.window.fit();
        ui.fireEvent(new mxEventObject('sidebar'));
        
        ui.getLocalData('sidebar', function(value)
        {
            ui.sidebar.showEntries(value, null, true);
        });
        ui.restoreLibraries();
    }
    else
    {
        ui.sidebarWindow.window.setVisible(!ui.sidebarWindow.window.isVisible());
        
        if (ui.sidebarWindow.window.isVisible())
        {
            ui.sidebarWindow.window.fit();
        }
    }
    
    var offset = mxUtils.getOffset(ui.container);
    ui.sidebarWindow.window.div.style.top = Math.max(parseInt(ui.sidebarWindow.window.div.style.top),
            offset.y - ((fullscreen) ? 0 : rect.top)) + 'px';
};

let menuCommands = [
    {
        id: quip.apps.DocumentMenuCommands.MENU_MAIN,
        subCommands: [
            "outline",
            "layers",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "find",
            "tags",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "export",
            "preferences",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "help"
        ]
    },
    {
        id: 'help',
        label: '=help',
        subCommands: [
            "quickStart",
            "keyboardShortcuts",
            "support",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "about"
        ]
    },
    {
        id: "export",
        label: "=export",
        subCommands: [
            "exportPng",
            "exportJpg",
            "exportSvg",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "exportPdf",
            "exportVsdx",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "exportHtml",
            "exportXml",
            "exportUrl",
            quip.apps.DocumentMenuCommands.SEPARATOR,            
            "embed"
        ]
    },
    {
        id: "embed",
        label: "=embed",
        subCommands: [
            "embedImage",
            "embedSvg",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "embedHtml",
            "embedIframe"
        ]
    },
    {
        id: "insert",
        label: "=insert",
        subCommands: [
            "insertRectangle",
            "insertEllipse",
            "insertRhombus",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "insertText",
            "insertLink",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "insertImage",
            "insertTemplate",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "insertLayout",
            "insertAdvanced",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "importFile"
        ]
    },
    {
        id: "insertAdvanced",
        label: "=advanced",
        subCommands: [
             "importText",
             "createShape",
             "plantUml",
             quip.apps.DocumentMenuCommands.SEPARATOR,
             "importCsv",
             "formatSql",
             "editDiagram",
             quip.apps.DocumentMenuCommands.SEPARATOR,
             "insertPage"
        ]
    },
    {
        id: "insertLayout",
        label: "Layout",
        subCommands: [
            "horizontalFlow",
            "verticalFlow",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "horizontalTree",
            "verticalTree",
            "radialTree",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "organic",
            "circle"
        ]
    },
    {
        id: "nextPage",
        label: "❯",
        handler: () => {
            graph.popupMenuHandler.hideMenu();
            ui.selectNextPage(true);
        }
    },
    {
        id: "prevPage",
        label: "❮",
        handler: () => {
            graph.popupMenuHandler.hideMenu();
            ui.selectNextPage(false);
        }
    },
    createCmd('embedImage', '=image...'),
    createCmd('embedSvg', '=formatSvg...'),
    createCmd('embedHtml', '=html...'),
    createCmd('embedIframe', '=iframe...'),
    createCmd('quickStart', '=quickStart...'),
    createCmd('keyboardShortcuts', '=keyboardShortcuts...'),
    createCmd('about', '=aboutDrawio...'),
    createCmd('preferences', '=preferences...'),
    createCmd('debug', 'Debug'),
    createCmd('editDiagram', '=formatXml...'),
    createCmd('exportPdf', '=formatPdf...'),
    createCmd('exportPng', '=formatPng...'),
    createCmd('exportJpg', '=formatJpg...'),
    createCmd('exportSvg', '=formatSvg...'),
    createCmd('exportVsdx', '=formatVsdx...'),
    createCmd('exportXml', '=formatXml...'),
    createCmd('exportUrl', '=url...'),
    createCmd('exportHtml', '=formatHtmlEmbedded...'),
    createCmd('importFile', '=file...'),
    createCmd('importCsv', '=csv...'),
    createCmd('importText', '=text...'),
    createCmd('print', '=print...'),
    createCmd('plantUml', '=plantUml...'),
    createCmd('formatSql', '=formatSql...'),
    {
        id: "fullscreen",
        quipIcon: quip.apps.MenuIcons.FULL_SCREEN,
        handler: () => {
            setFullscreen(!fullscreen);
        }
    },
    {
        id: "support",
        label: "=support",
        handler: () => {
            quip.apps.openLink('https://desk.draw.io/support/solutions/articles/16000075852');
        }
    },
    {
        id: "lock",
        label: "🔐",
        handler: () => {
            toggleLocked();
        }
    },
    {
        id: "unlock",
        label: "🔓",
        handler: () => {
            toggleLocked();
        }
    },
    {
        id: "comments",
        label: "=comment...",
        handler: () => {
            quip.apps.showComments(rootRecord.getId());
        }
    },
    {
        id: "fit",
        label: "=fit",
        handler: () => {
            if (ui != null)
            {
                if (graph != null)
                {
                    graph.popupMenuHandler.hideMenu();
                }
                
                fitDiagram(true);
            }
        }
    },
    createCmd('outline', '=outline...'),
    createCmd('layers', '=layers...'),
    createCmd('tags', '=tags...'),
    createCmd('find', '=find...'),
    {
        id: "format",
        label: "=format",
        handler: () => {
            toggleFormat();
        }
    },
    {
        id: "shapes",
        label: "=shapes",
        handler: () => {
            toggleShapes();
        }
    },
    createCmd('insertRectangle', '=rectangle'),
    createCmd('insertEllipse', '=ellipse'),
    createCmd('insertRhombus', '=rhombus'),
    createCmd('insertText', '=text'),
    createCmd('insertImage', '=image...'),
    createCmd('insertTemplate', '=template...'),
    createCmd('insertLink', '=link...'),
    createCmd('insertPage', '=page'),
    createCmd('createShape', '=shape...'),
    createCmd('undo', '⟲'),
    createCmd('redo', '⟳'),
    addLayout('horizontalFlow', '=horizontalFlow...'),
    addLayout('verticalFlow', '=verticalFlow...'),
    addLayout('horizontalTree', '=horizontalTree...'),
    addLayout('verticalTree', '=verticalTree...'),
    addLayout('radialTree', '=radialTree...'),
    addLayout('organic', '=organic...'),
    addLayout('circle', '=circle...'),
    {
        id: "delete",
        label: "=delete",
        handler: () => {
            doDelete();
        }
    },
    {
        id: "zoomIn",
        label: "➕",
        handler: () => {
            if (ui != null)
            {
                ui.actions.get('zoomIn').funct();
            }
        }
    },
    {
        id: "zoomOut",
        label: "➖",
        handler: () => {
            if (ui != null)
            {
                ui.actions.get('zoomOut').funct();
            }
        }
    }
];

function toggleLocked(ignoreLocked, onLoad)
{
    if (!isReadOnlyMode())
    {
        if (!ignoreLocked)
        {
            locked = (locked == null) ? true : !locked;
            viewerConfig.locked = locked;
            
            if (!isDocumentTemplate())
            {
                rootRecord.set("config", JSON.stringify(viewerConfig));
            }
        }
        
        if (locked && graph != null)
        {
            graph.escape();
        }
        
        if (ui != null)
        {
            ui.destroy();
            ui = null;
            
            container.style.backgroundImage = 'url(' + drawImage + ')';
            container.style.backgroundPosition = 'center center';
            
            if (container.style.height == '')
            {
                container.style.height = '64px';
                var w = quip.apps.getContainerWidth();
                quip.apps.setWidthAndAspectRatio(w, 64 / w);
            }
        }
    
        if (ui == null)
        {
            createViewer(true, true, onLoad);
        }
    }
};

function main(isCreateViewer, onLoad)
{
    // Workaround for async loading of JS resources in production
    if (window.EditorUi == null)
    {
        var prev = window.mxIntegrateCallback;
        
        window.mxIntegrateCallback = function()
        {
            main(isCreateViewer, onLoad);
            
            if (prev != null)
            {
                prev();
            }
        };
        
        return;
    }
    
    if (viewerConfig == null || window.EditorUi == null)
    {
        return;
    }
    
	// Test for iframe embedding of remote diagrams
    if (viewerConfig.url != null)
    {
        var iframe = document.createElement('iframe');
        iframe.style.cssText = 'border:0;top:0px;left:0;width:100%;height:100%;';
        iframe.setAttribute('frameborder', '0');
        iframe.src = viewerConfig.url;
        
        var h = viewerConfig.height || defaultHeight;
        var w = quip.apps.getContainerWidth();
        quip.apps.setWidthAndAspectRatio(w, h / w);
        
        container.style.backgroundImage = 'none';
        container.style.height = h + 'px';
        container.appendChild(iframe);
        
        return;
    }

    // Site-wide configuration
    var configData = quip.apps.getSitePreferences().getForKey('configuration') || defaultConfig;
    
    try
    {
        // Code must execute before mxSettings.load in mxSettings.js (from drawio-plugins)
        if (configData != null && mxUtils.trim(configData).length > 0)
        {
            var config = JSON.parse(mxUtils.trim(configData));

            if (config != null)
            {
                Editor.configure(config);
                
                if (config.debug != null)
                {
                	debugOutput = config.debug;
                }
                
                // Debug config without password
                var temp = JSON.parse(mxUtils.trim(configData));
                delete temp.password;

                debug('user is site admin', quip.apps.isViewerSiteAdmin());
                debug('using configuration', JSON.stringify(temp));
            }
        }
    }
    catch (e)
    {
        if (window.console != null)
        {
            console.log('draw.io configuration error:', e.message, configData);
        }
    }
    
    EditorUi.prototype.isDiagramActive = function()
	{
		return true;
	};
	
	var editorUiUpdateActionStates = EditorUi.prototype.updateActionStates;
	    
    EditorUi.prototype.updateActionStates = function()
	{
		editorUiUpdateActionStates.apply(this, arguments);
		
		this.actions.get('tags').setEnabled(true);
		this.actions.get('find').setEnabled(true);
		this.actions.get('layers').setEnabled(true);
		this.actions.get('outline').setEnabled(true);
	};

    // Workaround for no download in all native apps
    var editorUiSaveLocalFile = EditorUi.prototype.saveLocalFile;
    
    EditorUi.prototype.saveLocalFile = function(data, filename, mimeType, base64Encoded, format, allowBrowser, allowTab)
    {
        if (quip.apps.isNative != null && quip.apps.isNative())
        {
            this.doSaveLocalFile(data, filename, mimeType, base64Encoded);
        }
        else
        {
            editorUiSaveLocalFile.apply(this, arguments);
        }
    };
    
    // Disables remote conversion
    var editorUiIsRemoteVisioFormat = EditorUi.prototype.isRemoteVisioFormat;

	EditorUi.prototype.isRemoteVisioFormat = function(filename)
	{
		return (Editor.config == null ||
			Editor.config.remoteConvert == null ||
            Editor.config.remoteConvert) &&
            editorUiIsRemoteVisioFormat.apply(this, arguments);
	};
	
	var editorUiIsRemoteFileFormat = EditorUi.prototype.isRemoteFileFormat;

	EditorUi.prototype.isRemoteFileFormat = function(data, filename)
	{
		return (Editor.config == null ||
			Editor.config.remoteConvert == null ||
            Editor.config.remoteConvert) &&
            editorUiIsRemoteFileFormat.apply(this, arguments);
	};
	
    // Overridden to disable use of form for image downloads
    EditorUi.prototype.saveRequest = function(filename, format, fn, data, base64Encoded, mimeType, allowTab)
    {
        var xhr = fn(null, '1');
        
        if (xhr != null && this.spinner.spin(document.body, mxResources.get('saving')))
        {
            // LATER: Catch possible mixed content error
            // see http://stackoverflow.com/questions/30646417/catching-mixed-content-error
            xhr.send(mxUtils.bind(this, function()
            {
                this.spinner.stop();
                
                if (xhr.getStatus() >= 200 && xhr.getStatus() <= 299)
                {
                    try
                    {
                        if (format == 'xmlpng')
                        {
                            format = 'png';
                        }

                        this.doSaveLocalFile(xhr.getText(), filename, 'image/' + format, true, format);
                    }
                    catch (e)
                    {
                        this.handleError(e);
                    }
                }
                else
                {
                    this.handleError({message: mxResources.get('errorSavingFile')});
                }
            }), function(resp)
            {
                this.spinner.stop();
                this.handleError(resp);
            });
        }
    };

    // Overridden for Safari and all native apps for best-effort download by showing
    // images and non-binary file in an mxWindow inside the current window
    // NOTE: Blob API as follows gave "Blob downloads forbidden for this element"
    //  function base64ToArrayBuffer(base64) {
    //      var binary_string =  window.atob(base64);
    //      var len = binary_string.length;
    //      var bytes = new Uint8Array( len );
    //      for (var i = 0; i < len; i++)        {
    //          bytes[i] = binary_string.charCodeAt(i);
    //      }
    //      return bytes.buffer;
    //  }
    //  
    //  var blob = quip.apps.createBlobFromData(base64ToArrayBuffer(data));
    //  blob.onDataLoaded(function()
    //  {
    //      blob.downloadAsFile();
    //  }, function()
    //  {
    //      this.handleError(e, mxResources.get('errorLoadingFile')); 
    //  });
    if ((quip.apps.isNative != null && quip.apps.isNative()) || mxClient.IS_SF)
    {   
        EditorUi.prototype.doSaveLocalFile = function(data, filename, mimeType, base64Encoded, format)
        {
            if (mimeType.substring(0, 5) == 'image')
            {
                var div = document.createElement('div');
                div.style.textAlign = 'center';
                div.style.whiteSpace = 'nowrap';
                
                var img = document.createElement('img');
                img.setAttribute('src', 'data:' + mimeType + ((base64Encoded) ? ';base64,' +
                        data : ';charset=utf8,' + encodeURIComponent(data)));
                img.style.cssText = 'max-width:240px;max-height:150px;';
                div.appendChild(img);
                
                mxUtils.br(div);
                mxUtils.br(div);
                mxUtils.write(div, 'Right click to save image.');
                
                var dlg = new CustomDialog(ui, div, function()
                {
                    // do nothing
                }, null, mxResources.get('close'), null, null, true);
                
                ui.showDialog(dlg.container, 280, 230, true, true);
            }
            else
            {
                var dlg = new TextareaDialog(this, '', data, null, null, mxResources.get('close'));
                dlg.textarea.style.width = '600px';
                dlg.textarea.style.height = '380px';
                this.showDialog(dlg.container, 620, 460, true, true);
                dlg.init();
                document.execCommand('selectall', false, null);
            }
        };
    }

    // Overridden to use page.model
    EditorUi.prototype.getXmlFileData = function(ignoreSelection, currentPage)
    {
        ignoreSelection = (ignoreSelection != null) ? ignoreSelection : true;
        currentPage = (currentPage != null) ? currentPage : false;
        
        var node = this.editor.getGraphXml(ignoreSelection);
            
        if (ignoreSelection && this.fileNode != null && this.currentPage != null)
        {
            var data = Graph.compress(Graph.zapGremlins(mxUtils.getXml(node)));
            mxUtils.setTextContent(this.currentPage.node, data);
            node = this.fileNode.cloneNode(false);
            
            if (currentPage)
            {
                node.appendChild(this.currentPage.node);
            }
            else
            {
                // Restores order of pages
                for (var i = 0; i < this.pages.length; i++)
                {
                    if (this.pages[i].model != null && this.pages[i] != this.currentPage)
                    {
                        var enc = new mxCodec(mxUtils.createXmlDocument());
                        var temp = enc.encode(this.pages[i].model);
        
                        var data = Graph.compress(Graph.zapGremlins(mxUtils.getXml(temp)));
                        mxUtils.setTextContent(this.pages[i].node, data);
                    }

                    node.appendChild(this.pages[i].node);
                }
            }
        }
        
        return node;
    };

    var popupMenuShowSubmenu = mxPopupMenu.prototype.showSubmenu;
    
    mxPopupMenu.prototype.showSubmenu = function(parent, row)
    {
        popupMenuShowSubmenu.apply(this, arguments);
        
        if (row.div != null)
        {
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(row.div));
        }
    };

    var editorUiExecuteLayout = EditorUi.prototype.executeLayout; 
    
    EditorUi.prototype.executeLayout = function(exec, animate, post)
    {
        graph.container.style.visibility = 'hidden';
        
        function postWrapper()
        {
            if (post != null)
            {
                post();
            }
            
            fitDiagram();
            graph.container.style.visibility = '';
        };
        
        editorUiExecuteLayout.apply(this, [exec, false, postWrapper]);
    };

    // Workaround for window.print not working is to only show preview tab
    // NOTE: Printing not longer possible since preview tab and print on iframe are blocked
    PrintDialog.previewEnabled = false;
    PrintDialog.printPreview = function() {};
    
    // Disables embed preview in native apps
    EmbedDialog.showPreviewOption = quip.apps.isNative == null || !quip.apps.isNative();
    
    // Workaround for shadow not working on various platforms
    Editor.shadowOptionEnabled = !quip.apps.isMac() && !quip.apps.isIOs() &&
        !quip.apps.isAndroid() && !mxClient.IS_SF;
    var graphSetShadowVisible = Graph.prototype.setShadowVisible;
    
    Graph.prototype.setShadowVisible = function(value, fireEvent)
    {
        graphSetShadowVisible.apply(this, [Editor.shadowOptionEnabled && value, fireEvent]);
    };
    
    // Disables CSS transforms in editable documents
	var graphIsCssTransformsSupported = Graph.prototype.isCssTransformsSupported;
    
    Graph.prototype.isCssTransformsSupported = function()
    {
    	return !isDocumentEditable() && graphIsCssTransformsSupported.apply(this, arguments);
    };
    
    // Disables popup windows
    EmbedDialog.showPreviewOption = false;
    Editor.popupsAllowed = false;
    
    // Disables new window option in edit dialog
    EditDiagramDialog.showNewWindowOption = false;
    
    // Overridden to use openLink for links in labels and on shapes
    var createLinkForHint = Graph.prototype.createLinkForHint;
    
    Graph.prototype.createLinkForHint = function(link, label)
    {
        var elt = createLinkForHint.apply(this, arguments);
        
        mxEvent.addListener(elt, 'click', function(evt)
        {
            if (!mxEvent.isPopupTrigger(evt))
            {
                var href = elt.getAttribute('href');
                
                if (!graph.isCustomLink(href))
                {
                    graph.openLink(href);
                }
                
                mxEvent.consume(evt);
            }
        });
        
        return elt;
    };
    
    function updateHint()
    {
        if (this.hint != null && this.hint.parentNode == graph.container)
        {
            container.appendChild(this.hint);
        }
    };
    
    var graphHandlerUpdateHint = mxGraphHandler.prototype.updateHint;
    var vertexHandlerUpdateHint = mxVertexHandler.prototype.updateHint;
    var edgeHandlerUpdateHint = mxEdgeHandler.prototype.updateHint;
    
    mxGraphHandler.prototype.updateHint = function(me)
    {
        graphHandlerUpdateHint.apply(this, arguments);
        updateHint.apply(this, arguments);
    };
    
    mxVertexHandler.prototype.updateHint = function(me)
    {
        vertexHandlerUpdateHint.apply(this, arguments);
        updateHint.apply(this, arguments);
    };

    mxEdgeHandler.prototype.updateHint = function(me)
    {
        edgeHandlerUpdateHint.apply(this, arguments);
        updateHint.apply(this, arguments);
    };
    
    // Only switches to page view if format is changed in fullscreen mode
    EditorUi.prototype.setPageFormat = function(value)
    {
        this.editor.graph.pageFormat = value;
        
        if (!this.editor.graph.pageVisible && fullscreen)
        {
            this.actions.get('pageView').funct();
        }
        else
        {
            this.editor.graph.view.validateBackground();
            this.editor.graph.sizeDidChange();
        }

        this.fireEvent(new mxEventObject('pageFormatChanged'));
    };
    
    // Fixes clipping for link hints (hides during panning)
    (function()
    {
        function handlerInit()
        {
            this.panHandler = mxUtils.bind(this, function()
            {
                if (this.linkHint != null)
                {
                    this.linkHint.style.visibility = 'hidden';
                }
            });
            
            this.state.view.graph.addListener(mxEvent.PAN, this.panHandler); 
        };
        
        var vertexHandlerInit = mxVertexHandler.prototype.init;
        var edgeHandlerInit = mxEdgeHandler.prototype.init;
        
        mxVertexHandler.prototype.init = function()
        {
            vertexHandlerInit.apply(this, arguments);
            handlerInit.apply(this, arguments);
        };
        
        mxEdgeHandler.prototype.init = function()
        {
            edgeHandlerInit.apply(this, arguments);
            handlerInit.apply(this, arguments);
        };
        
        function handlerDestroy()
        {
            if (this.panHandler != null)
            {
                this.state.view.graph.removeListener(this.panHandler);
                this.panHandler = null;
            }
        };
        
        var vertexHandlerDestroy = mxVertexHandler.prototype.destroy;
        var edgeHandlerDestroy = mxEdgeHandler.prototype.destroy;
        
        mxVertexHandler.prototype.destroy = function()
        {
            vertexHandlerDestroy.apply(this, arguments);
            handlerDestroy.apply(this, arguments);
        };

        mxEdgeHandler.prototype.destroy = function()
        {
            edgeHandlerDestroy.apply(this, arguments);
            handlerDestroy.apply(this, arguments);
        };
        
        // Detaches link hint for event handling and avoid clipping
        function updateLinkHint()
        {
            if (this.linkHint != null && this.linkHint.parentNode == graph.container)
            {
                container.appendChild(this.linkHint);
                quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.linkHint));
            }
        };

        var vertexHandlerUpdateLinkHint = mxVertexHandler.prototype.updateLinkHint;
        var edgeHandlerUpdateLinkHint = mxEdgeHandler.prototype.updateLinkHint;
        
        mxVertexHandler.prototype.updateLinkHint = function(link, links)
        {
            vertexHandlerUpdateLinkHint.apply(this, arguments);
            updateLinkHint.apply(this, arguments);
        };
        
        mxEdgeHandler.prototype.updateLinkHint = function(link, links)
        {
            edgeHandlerUpdateLinkHint.apply(this, arguments);
            updateLinkHint.apply(this, arguments);
        };
        
        function redrawHandles()
        {
            if (this.linkHint != null)
            {
                this.linkHint.style.visibility = '';
            }
        };
        
        var vertexHandlerRedrawHandles = mxVertexHandler.prototype.redrawHandles;
        var edgeHandlerRedrawHandles = mxEdgeHandler.prototype.redrawHandles;
        
        mxVertexHandler.prototype.redrawHandles = function(link, links)
        {
            if (this.index != null && this.index != mxEvent.ROTATION_HANDLE)
            {
                this.rotationShape.node.style.display = 'none';
            }

            vertexHandlerRedrawHandles.apply(this, arguments);
            redrawHandles.apply(this, arguments);
        };
        
        mxEdgeHandler.prototype.redrawHandles = function(link, links)
        {
            if (this.index == null)
            {
                edgeHandlerRedrawHandles.apply(this, arguments);
                redrawHandles.apply(this, arguments);
            }
        };
    })();

    // Redirects to webapp
    Editor.prototype.editBlankUrl = 'http://www.draw.io/';
    
    // Redirects to Quip abstraction layer
    Graph.prototype.openLink = function(href, target)
    {
        quip.apps.openLink(href);
    };
 
    // Overridden to add ignoreHeight
    EditorUi.prototype.lightboxFit = function()
    {
         if (this.isDiagramEmpty())
         {
             this.editor.graph.view.setScale(1);
         }
         else
         {
             // LATER: Use initial graph bounds to avoid rounding errors
             this.editor.graph.maxFitScale = ((viewerConfig != null &&
                     viewerConfig.maxZoom != null) ?
                         viewerConfig.maxZoom : defaultMaxZoom);
             this.editor.graph.fit(padding, null, null, null, null, !fullscreen);
             this.editor.graph.maxFitScale = null;
         }
    };

    // Overridden to use global locked state
    EditorUi.prototype.isPageInsertTabVisible = function()
    {
        return !locked;
    };

    // Redirects local storage
    EditorUi.prototype.getLocalData = function(key, fn)
    {
        var tmp = rootRecord.get("storage");
        
        fn((tmp == null) ? null : JSON.parse(tmp)[key]);
    };
    
    EditorUi.prototype.setLocalData = function(key, data, fn)
    {
        var tmp = rootRecord.get("storage");
        var obj = (tmp == null) ? {} : JSON.parse(tmp);
        obj[key] = data;
        rootRecord.set("storage", JSON.stringify(obj));
        
        if (fn != null)
        {
            fn();
        }
    };
    
    EditorUi.prototype.removeLocalData = function(key, fn)
    {
        var tmp = rootRecord.get("storage");
        
        if (tmp != null)
        {
            var obj = JSON.parse(tmp);
            delete obj[key];
            rootRecord.set("storage", JSON.stringify(obj));
        }
        
        fn();
    };
    
    // Disables writing of dx and dy to file to avoid change detection
    var editorGetGraphXml = Editor.prototype.getGraphXml;
    
    Editor.prototype.getGraphXml = function(ignoreSelection)
    {
        var node = editorGetGraphXml.apply(this, arguments);
        
        node.removeAttribute('dx');
        node.removeAttribute('dy');
        
        return node;
    };
    
    // Initializes sidebar before initializing trees module for overrides to work
    var editorUiAddTrees = EditorUi.prototype.addTrees;
    
    EditorUi.prototype.addTrees = function()
    {
        var div = document.createElement('div');
        div.style.cssText = 'position:absolute;left:0px;right:0px;top:0px;bottom:63px;overflow-y:auto;overflow-x:hidden;';
        this.sidebar = this.createSidebar(div);

        editorUiAddTrees.apply(this, arguments);
    };

    // Adds per-diagram sidebar configuration
    var sidebarShowEntries = Sidebar.prototype.showEntries;
    
    Sidebar.prototype.showEntries = function(newValue, remember, force)
    {
        sidebarShowEntries.apply(this, arguments);

        if (ui != null && newValue != null)
        {
            ui.getLocalData('sidebar', function(oldValue)
            {
                if (oldValue != newValue)
                {
                    ui.setLocalData('sidebar', newValue);
                }
            });
        }
    };
    
    // Transfers focus to graph after click in sidebar
    var sidebarItemClicked = Sidebar.prototype.itemClicked; 
    
    Sidebar.prototype.itemClicked = function(cells, ds, evt, elt)
    {
        sidebarItemClicked.apply(this, arguments);
        graph.container.focus();
    };
    
    // Shows sidebar window when libaries are loaded
    // FIXME: Shows library window twice
    /*var libraryLoaded = EditorUi.prototype.libraryLoaded;
    
    EditorUi.prototype.libraryLoaded = function(mode)
    {
        libraryLoaded.apply(this, arguments);
        
        if (ui.sidebarWindow == null || !ui.sidebarWindow.isVisible())
        {
            toggleShapes();
        }
    };*/

    // Adds support for device libraries
    EditorUi.prototype.pickLibrary = function(mode)
    {
        if (Graph.fileSupport && !mxClient.IS_IE && !mxClient.IS_IE11)
        {
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            
            mxEvent.addListener(input, 'change', mxUtils.bind(this, function()
            {
                if (input.files != null)
                {
                    for (var i = 0; i < input.files.length; i++)
                    {
                        (mxUtils.bind(this, function(file)
                        {
                            var reader = new FileReader();
                        
                            reader.onload = mxUtils.bind(this, function(e)
                            {
                                try
                                {
                                    this.loadLibrary(new LocalLibrary(this, e.target.result, file.name));
                                }
                                catch (e)
                                {
                                    this.handleError(e, mxResources.get('errorLoadingFile'));
                                }
                            });

                            reader.readAsText(file);
                        }))(input.files[i]);
                    }
                }
            }));

            input.click();
        }
    };

    EditorUi.prototype.saveLibrary = function(name, images, file, mode, noSpin, noReload, fn)
    {
        mode = (mode != null) ? mode : this.mode;
        noSpin = (noSpin != null) ? noSpin : false;
        noReload = (noReload != null) ? noReload : false;
        var xml = this.createLibraryDataFromImages(images);
        
        var error = mxUtils.bind(this, function(resp)
        {
            this.spinner.stop();
            
            if (fn != null)
            {
                fn();
            }
            
            this.handleError(resp, (resp != null) ? mxResources.get('errorSavingFile') : null);
        });

        // Handles special case for local libraries
        if (file == null)
        {
            file = new LocalLibrary(this, xml, name);
        }
        
        if (noSpin || this.spinner.spin(document.body, mxResources.get('saving')))
        {
            file.setData(xml);
            
            var doSave = mxUtils.bind(this, function()
            {
                file.save(true, mxUtils.bind(this, function(resp)
                {
                    this.spinner.stop();
                    this.hideDialog(true);
                    
                    if (!noReload)
                    {
                        this.libraryLoaded(file, images);
                    }
                    
                    if (fn != null)
                    {
                        fn();
                    }
                }), error);
            });
            
            if (name != file.getTitle())
            {
                var oldHash = file.getHash();
                
                file.rename(name, mxUtils.bind(this, function(resp)
                {
                    // Change hash in stored settings
                    if (file.constructor != LocalLibrary && oldHash != file.getHash())
                    {
                        mxSettings.removeCustomLibrary(oldHash);
                        mxSettings.addCustomLibrary(file.getHash());
                    }

                    // Workaround for library files changing hash so
                    // the old library cannot be removed from the
                    // sidebar using the updated file in libraryLoaded
                    this.removeLibrarySidebar(oldHash);

                    doSave();
                }), error)
            }
            else
            {
                doSave();
            }
        }
    };

    /**
     * Supported domains must be enabled in manifest.json
     */
    Editor.prototype.isCorsEnabledForUrl = function(url)
    {
        return /^https?:\/\/[^\/]*\.quip\.com\//.test(url) ||
                /^https?:\/\/[^\/]*\.iconfinder.com\//.test(url) ||
                /^https?:\/\/[^\/]*\.cloudfront.net\//.test(url) ||
                /^https?:\/\/[^\/]*\.draw.io\//.test(url);
    };

    EditorUi.prototype.restoreLibraries = function()
    {
        if (this.sidebar != null)
        {
            if (this.pendingLibraries == null)
            {
                this.pendingLibraries = new Object();
            }
            
            // Ignores this library next time
            var ignore = mxUtils.bind(this, function(id)
            {
                mxSettings.removeCustomLibrary(id); 
                delete this.pendingLibraries[id];
            });
                    
            var load = mxUtils.bind(this, function(libs, done)
            {
                var waiting = 0;
                var files = [];

                // Loads in order of libs array
                var checkDone = mxUtils.bind(this, function()
                {
                    if (waiting == 0)
                    {
                        if (libs != null)
                        {
                            for (var i = libs.length - 1; i >= 0; i--)
                            {
                                if (files[i] != null)
                                {
                                    this.loadLibrary(files[i]);
                                }
                            }
                        }
                        
                        if (done != null)
                        {
                            done();
                        }
                    }
                });
                
                if (libs != null)
                {
                    for (var i = 0; i < libs.length; i++)
                    {
                        var name = encodeURIComponent(decodeURIComponent(libs[i]));
                        
                        (mxUtils.bind(this, function(id, index)
                        {
                            if (id != null && id.length > 0 && this.pendingLibraries[id] == null &&
                                this.sidebar.palettes[id] == null)
                            {
                                // Waits for all libraries to load
                                var onload = mxUtils.bind(this, function(file)
                                {
                                    delete this.pendingLibraries[id];
                                    files[index] = file;
                                    waiting--;
                                    checkDone();
                                });
                                
                                var onerror = mxUtils.bind(this, function()
                                {
                                    ignore(id);
                                    waiting--;
                                    checkDone();
                                });
                                
                                this.pendingLibraries[id] = true;
                                var service = id.substring(0, 1);
                                
                                if (service == 'U')
                                {
                                    waiting++;
                                    var url = decodeURIComponent(id.substring(1));
                                    
                                    if (!this.isOffline())
                                    {
                                        var realUrl = url;
                                        
                                        if (!this.editor.isCorsEnabledForUrl(realUrl))
                                        {
                                            var nocache = 't=' + new Date().getTime();
                                            realUrl = PROXY_URL + '?url=' + encodeURIComponent(url) + '&' + nocache;
                                        }
                                        
                                        try
                                        {
                                            // Uses proxy to avoid CORS issues
                                            mxUtils.get(realUrl, mxUtils.bind(this, function(req)
                                            {
                                                if (req.getStatus() >= 200 && req.getStatus() <= 299)
                                                {
                                                    try
                                                    {
                                                        onload(new UrlLibrary(this, req.getText(), url));
                                                    }
                                                    catch (e)
                                                    {
                                                        onerror();
                                                    }
                                                }
                                                else
                                                {
                                                    onerror();
                                                }
                                            }), function()
                                            {
                                                onerror();
                                            });
                                        }
                                        catch (e)
                                        {
                                            onerror();
                                        }
                                    }
                                }
                            }
                        }))(name, i);
                    }
                    
                    checkDone();
                }
                else
                {
                    checkDone();
                }
            });
            
            load(Editor.defaultCustomLibraries, mxUtils.bind(this, function()
            {
                this.getLocalData('customLibraries', mxUtils.bind(this, function(value)
                {
                    load(value);
                }));
            }));
        }
    };

    // Redirects to user preferences
    mxSettings.save = function()
    {
        try
        {
            delete mxSettings.settings.isNew;
            mxSettings.settings.version = mxSettings.currentVersion;
            var libs = mxSettings.getCustomLibraries();
            mxSettings.settings.customLibraries = [];
            quip.apps.getUserPreferences().save({'settings': JSON.stringify(mxSettings.settings)});
            
            // Redirects custom libs to record
            ui.setLocalData('customLibraries', libs);
        }
        catch (e)
        {
            // ignores quota exceeded
        }
    };
    
    mxSettings.load = function()
    {
        mxSettings.parse(quip.apps.getUserPreferences().getForKey('settings'));
        
        if (mxSettings.settings == null)
        {
            mxSettings.init();
        }
        else
        {
            // Redirects custom libs to record
            var tmp = rootRecord.get("storage");
            mxSettings.settings.customLibraries = (tmp == null) ?
            	mxSettings.settings.customLibraries : JSON.parse(tmp)['customLibraries'];
        }
    };
    
    mxSettings.clear = function() 
    {
        quip.apps.getUserPreferences().save({'settings': null});
    };
    
    mxSettings.load();

    Sidebar.prototype.searchFileUrl = '//' + domain + '/search.xml';
    EditorUi.prototype.lightboxMaxFitScale = (viewerConfig != null && viewerConfig.maxZoom != null) ?
       viewerConfig.maxZoom : defaultMaxZoom;
    EditorUi.prototype.footerHeight = 0;
    EditorUi.enablePlantUml = true;

    // Tab container is a custom container in Quip
    EditorUi.prototype.createTabContainer = function()
    {
        return null;
    };
    
    // Overridden to ignore tabContainer height for diagramContainer
    var editorUiRefresh = EditorUi.prototype.refresh;

    EditorUi.prototype.refresh = function(sizeDidChange)
    {
        editorUiRefresh.apply(this, arguments);
        this.diagramContainer.style.bottom = '0';
    };
    
    // Changes colors for some UI elements
    var fill = '#29b6f2';
    var stroke = '#ffffff';
    
    Editor.checkmarkImage = Graph.createSvgImage(22, 18, '<path transform="translate(4 0)" d="M7.181,15.007a1,1,0,0,1-.793-0.391L3.222,10.5A1,1,0,1,1,4.808,9.274L7.132,12.3l6.044-8.86A1,1,0,1,1,14.83,4.569l-6.823,10a1,1,0,0,1-.8.437H7.181Z" fill="' + fill + '"/>').src;
    mxWindow.prototype.closeImage = Graph.createSvgImage(18, 10, '<path d="M 5 1 L 13 9 M 13 1 L 5 9" stroke="#C0C0C0" stroke-width="2"/>').src;
    mxWindow.prototype.minimizeImage = Graph.createSvgImage(14, 10, '<path d="M 3 7 L 7 3 L 11 7" stroke="#C0C0C0" stroke-width="2" fill="#ffffff"/>').src;
    mxWindow.prototype.normalizeImage = Graph.createSvgImage(14, 10, '<path d="M 3 3 L 7 7 L 11 3" stroke="#C0C0C0" stroke-width="2" fill="#ffffff"/>').src;
    mxWindow.prototype.maximizeImage = 'data:image/gif;base64,R0lGODlhDAAMAPcAAP///0RERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAADAAMAAAIMAADCBxIcCCAgwgTCgRQ0ODChg8DMEx4UOJDihMvUrRoESPHiRsZcmwoEqNCiAUDAgA7';
    mxWindow.prototype.resizeImage = 'data:image/gif;base64,R0lGODlhDAAMAJECAP///4CAgNTQyAAAACH5BAEAAAIALAAAAAAMAAwAAAIblI8CmRB83IMSqvBWw3dnHnFV+GVGhZZXmaoFADs=';
    
    mxConstants.VERTEX_SELECTION_COLOR = '#C0C0C0';
    mxConstants.EDGE_SELECTION_COLOR = '#C0C0C0';
    mxConstants.CONNECT_HANDLE_FILLCOLOR = '#cee7ff';
    
    mxConstants.DEFAULT_VALID_COLOR = fill;
    mxConstants.GUIDE_COLOR = '#C0C0C0';

    mxConstants.HIGHLIGHT_STROKEWIDTH = 5;
    mxConstants.HIGHLIGHT_OPACITY = 35;
    
    Format.prototype.inactiveTabBackgroundColor = '#f0f0f0';
    mxGraphHandler.prototype.previewColor = '#C0C0C0';
    mxRubberband.prototype.defaultOpacity = 50;
    HoverIcons.prototype.inactiveOpacity = 25;
    Graph.prototype.editAfterInsert = true;
    Graph.prototype.svgShadowColor = '#3D4574';
    Graph.prototype.svgShadowOpacity = '0.4';
    Graph.prototype.svgShadowSize = '0.6';
    Graph.prototype.svgShadowBlur = '1.2';
    
    // Fixes sidebar tooltips (previews)
    Sidebar.prototype.getTooltipOffset = function()
    {
        var off = mxUtils.getOffset(ui.sidebarWindow.window.div);
        off.y += 40;
        
        return off;
    };
    
    // Adds context menu items
    var menuCreatePopupMenu = Menus.prototype.createPopupMenu;
    
    Menus.prototype.createPopupMenu = function(menu, cell, evt)
    {
        var graph = this.editorUi.editor.graph;
        menu.smartSeparators = true;
        
        if (graph.isSelectionEmpty() && quip.apps.isMobile())
        {
            this.addMenuItems(menu, ['zoomIn', 'zoomOut', 'fit', '-'], null, evt);    
        }
        
        menuCreatePopupMenu.apply(this, arguments);

        var promptSpacing = mxUtils.bind(this, function(defaultValue, fn)
        {
            var dlg = new FilenameDialog(this.editorUi, defaultValue, mxResources.get('apply'), function(newValue)
            {
                fn(parseFloat(newValue));
            }, mxResources.get('spacing'));
            this.editorUi.showDialog(dlg.container, 300, 80, true, true);
            dlg.init();
        });
        
        if (graph.getSelectionCount() == 1)
        {
            this.addMenuItems(menu, ['editTooltip', 'editStyle', '-'], null, evt);

            if (quip.apps.isMobile())
            {
                this.addMenuItems(menu, ['toggleFormat', '-'], null, evt);
            }
            
            if (graph.isCellFoldable(graph.getSelectionCell()))
            {
                this.addMenuItems(menu, (graph.isCellCollapsed(cell)) ? ['expand'] : ['collapse'], null, evt);
            }

            this.addMenuItems(menu, ['collapsible', '-', 'lockUnlock', 'enterGroup'], null, evt);
            menu.addSeparator();
            this.addSubmenu('layout', menu);
            
//            if (domain == 'test.draw.io')
//            {
//                this.addMenuItems(menu, ['-', 'addComment', '-'], null, evt);
//            }
        }
        else if (graph.isSelectionEmpty())
        {
            if (graph.isEnabled())
            {
                menu.addSeparator();

                if (quip.apps.isMobile())
                {
                    this.addMenuItems(menu, ['toggleShapes', '-'], null, evt);    
                }

                this.addMenuItems(menu, ['-', 'editData', '-'], null, evt);

                this.addSubmenu('insert', menu);
                this.addSubmenu('layout', menu);
                this.addSubmenu('options', menu);

                this.addMenuItems(menu, ['-', 'exitGroup'], null, evt);
            }
            
            if (!quip.apps.isMobile())
            {
                if (fullscreen)
                {
                    this.addMenuItems(menu, ['exitFullscreen'], null, evt);
                }
                else
                {
                    this.addMenuItems(menu, ['fullscreen'], null, evt);
                }
            }

            if (debugOutput)
            {
                this.addMenuItems(menu, ['-', 'refresh', 'debug'], null, evt);
            }
        }
    };
    
    // Overridden to redirect clipart
    function convertImageUrl(url)
    {
        //we rewrite the URL of the images so diagrams made with draw.io online work in the plugins and vice versa
        if (url.substring(0, 4) == 'img/') 
        {
            url = 'https://' + domain + '/' + url;
        }
        else if (url.substring(0, 5) == '/img/') 
        {
            url = 'https://' + domain + url;
        }
        
        return url;
    };
    
    /**
     * Overrides url converter for exporting images.
     */
    mxUrlConverter.prototype.convert = function(url)
    {
        if (this.isEnabled() && this.isRelativeUrl(url))
        {
            url = convertImageUrl(url);
        }
        
        return url;
    };
    
    /**
     * Overrides canvas for SVG export to create absolute image URLs.
     */
    var graphCreateSvgCanvas = Graph.prototype.createSvgCanvas;
    
    Graph.prototype.createSvgCanvas = function(node)
    {
        var canvas = graphCreateSvgCanvas.apply(this, arguments);
        var oldConvert = canvas.converter.convert;
        
        canvas.converter.convert = function(url) 
        {
            url = oldConvert.apply(this, arguments);
            
            if (url != null && this.isEnabled() && this.isRelativeUrl(url))
            {
                loc = '//' + domain;
                
                if (url.substring(0, 4) == 'img/') 
                {
                    url = loc + '/' + url;
                }
                else if (url.substring(0, 4) == '/img') 
                {
                    url = loc + url;
                }
            }

            return url;
        };
        
        return canvas;
    };
    
    /**
     * Overrides sanitizer for links in labels (img.src and a.href).
     */
    Graph.prototype.sanitizeHtml = function(value, editing)
    {
        // Uses https://code.google.com/p/google-caja/wiki/JsHtmlSanitizer
        // NOTE: Original minimized sanitizer was modified to support data URIs for images
        // LATER: Add MathML to whitelisted tags
        function urlX(link, arg2, arg3, tag)
        {
            if (link != null && link.toString().toLowerCase().substring(0, 11) !== 'javascript:')
            {
                // Rewrites URLs for a.href and img.src for non-editing labels
                if (!editing)
                {
                    // Since this is a hack via link.g we need to check if all arguments are valid
                    if (link.g != null && link.g.length > 0 && tag != null && tag.TYPE == 'MARKUP')
                    {
                        // To be consistent with the above overrides we use different schemes for
                        // transforming image source and link refs
                        if (tag.XML_TAG == 'img' && tag.XML_ATTR == 'src')
                        {
                            link.g = convertImageUrl(link.g);
                        }
                    }
                }
                
                return link;
            }
            
            return null;
        };
        function idX(id) { return id };
        
        return html_sanitize(value, urlX, idX);
    };
    
    // Overridden to toggle window instead
    EditorUi.prototype.toggleFormatPanel = function(forceHide)
    {
        if (ui.formatWindow != null)
        {
            ui.formatWindow.window.setVisible((forceHide) ?
               false : !ui.formatWindow.window.isVisible());
        }
        else
        {
        	toggleFormat();
        }
    };
    
    // Hides keyboard shortcuts in menus
    Menus.prototype.addShortcut = function(item, action)
    {
        if (action.shortcut != null)
        {
            var td = item.firstChild.nextSibling;
            td.setAttribute('title', action.shortcut);
        }
    };

    /**
     * Disables close button in diagram tab.
     */
    Format.prototype.showCloseButton = false;

    DiagramFormatPanel.prototype.isShadowOptionVisible = function()
    {
        return true;
    };

    DiagramFormatPanel.prototype.isMathOptionVisible = function()
    {
        return true;
    };
    
    // Fixes modal dialogs in Quip
    var editorUiShowDialog = EditorUi.prototype.showDialog;
    
    EditorUi.prototype.showDialog = function(elt, w, h, modal, closable, onClose)
    {
        editorUiShowDialog.apply(this, arguments);
        
        if (this.dialog != null)
        {
            if (!fullscreen)
            {
                this.dialog.bg.style.position = '';
            }
            
            this.dialog.container.style.position = '';
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.dialog.bg));
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.dialog.container));
        }
    };

    Dialog.prototype.getPosition = function(left, top, w, h)
    {
        var offset = mxUtils.getOffset(ui.container);
        
        return new mxPoint(left, offset.y + Math.min(0, window.innerHeight - offset.y - h - 62));
    };
    
    // Fixes windows in Quip
    var windowInit = mxWindow.prototype.init;
    
    mxWindow.prototype.init = function(x, y, width, height, style)
    {
        var offset = mxUtils.getOffset(ui.container);
        y += offset.y;
        
        windowInit.call(this, x, y, width, height, style);
        quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.div));
        
        // Event catching on outer document
        var catcher = null;
        
        function addCatcher()
        {
            catcher = ui.createDiv('background');
            catcher.style.cssText = 'position:absolute;background:transparent;top:0px;left:0px;right:0px;bottom:0px;z-index:99999;';
            document.body.appendChild(catcher);
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(catcher));
        };
        
        function removeCatcher()
        {
              quip.apps.removeDetachedNode(ReactDOM.findDOMNode(catcher));
              catcher.parentNode.removeChild(catcher);
        };
        
        this.addListener(mxEvent.MOVE_START, addCatcher);
        this.addListener(mxEvent.MOVE_END, removeCatcher);
        this.addListener(mxEvent.RESIZE_START, addCatcher);
        this.addListener(mxEvent.RESIZE_END, removeCatcher);
        
        this.div.style.zIndex = minZIndex + 1;
    };
    
    // Execute fit page on page setup changes
    var changePageSetupExecute = ChangePageSetup.prototype.execute;
    
    ChangePageSetup.prototype.execute = function()
    {
        changePageSetupExecute.apply(this, arguments);

        if (this.page == this.ui.currentPage && this.format != null)
        {
            fitDiagram(true, true);
        }
    };

    var graphViewSetCurrentRoot = mxGraphView.prototype.setCurrentRoot;
    
    mxGraphView.prototype.setCurrentRoot = function(root)
    {
        graph.container.style.visibility = 'hidden';
        var parent = (graph.view.currentRoot != null) ? graph.view.currentRoot.parent : graph.model.root;
        graphViewSetCurrentRoot.apply(this, arguments);
        
        if (parent != ((graph.view.currentRoot != null) ? graph.view.currentRoot.parent : graph.model.root))
        {
            fitDiagram(true, true);
        }
        
        graph.container.style.visibility = '';
    };
    
    createViewer(isCreateViewer, null, onLoad);
}; // end of main

function doInit(callback, createUi)
{
    // Adds required resources (disables loading of fallback properties, this can only
    // be used if we know that all keys are defined in the language specific file)
    mxResources.loadDefaultBundle = false;
    var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
        mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

    // Initialize MathJax just once
    // LATER: Disable use of cookies in MathJax
    if (quip.apps.isOnline() && typeof window.MathJax === 'undefined' &&
        (Editor.config == null ||  Editor.config.mathematicalTypesetting == null ||
         Editor.config.mathematicalTypesetting))
    {
        Editor.initMath();
        
        Editor.doMathJaxRender = function(container)
        {
            window.setTimeout(function()
            {
                if (container.style.visibility != 'hidden')
                {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, container]);
                }
            }, 0);
        };
    }
    
    // Creates UI and invokes callback
    function start(resources)
    {
        mxResources.parse(resources);
        
        var ui = (createUi != null) ? createUi() : new App(new Editor(urlParams['chrome'] == '0'));
        
        if (callback != null)
        {
            if (ui != null)
            {
                var w = quip.apps.getContainerWidth();
                container.style.height = '64px';
                quip.apps.setWidthAndAspectRatio(w, 64 / w);
            }
            
            callback(ui);
        }
    };
    
    if (Editor.config != null && Editor.config.plantUml != null && !Editor.config.plantUml)
    {
        EditorUi.enablePlantUml = false;
    }
    
    if (Editor.config != null && Editor.config.iconfinder != null && !Editor.config.iconfinder)
    {
        window.ICONSEARCH_PATH = null;
    }
    
    // Bypass XHR for default resources
    if (!quip.apps.isOnline() || bundle.substring(bundle.length - 8, bundle.length) == '/dia.txt' ||
        (Editor.config != null && Editor.config.internationalization != null &&
         !Editor.config.internationalization))
    {
        start(defaultResources);
    }
    else
    {
        // Prefetches asynchronous requests so that below code runs synchronous
        // Loading the correct bundle (one file) via the fallback system in mxResources. The stylesheet
        // is compiled into JS in the build process and is only needed for local development.
        mxUtils.getAll([bundle], function(xhr)
        {
            start(xhr[0].getText());
        }, function()
        {
            // Fallback to default resources
            start(defaultResources);
        });
    }
}; // end of doInit

function initSession(fitWindow)
{
    if (ui != null && ui.session == null)
    {
        var entry = getData(true);

        if (entry != null && entry.data != null)
        {
            var fit = false;
            
            if (preview != null)
            {
                preview.parentNode.removeChild(preview);
                preview = null;
                fit = true;
            }

            graph.container.style.display = '';
            container.style.backgroundImage = 'none';
            container.style.display = '';
            ui.setFileData(entry.data);
            ui.editor.undoManager.clear();

            if (!isDocumentTemplate())
            {
                ui.session = new Session(graph, sessionId, rootRecord.get('edits'));
                ui.session.revisionId = entry.id;
                ui.session.init(entry.lastEdit, fitWindow || fit);
            }

            if (dlg != null)
            {
                destroyNewDialog();
            }
            else
            {
                var err = document.getElementById('error');
                
                if (err != null)
                {
                    err.parentNode.removeChild(err);
                    fitDiagram(true, true);
                    
                    quip.apps.enableResizing({maintainAspectRatio: true, minWidth: 100, minHeight: 100});
                    
                    if (quip.apps.isAppFocused())
                    {
                        ui.vHandle.style.display = '';
                    }
                }

                updateBorder();
                updateActions();
            }
        }
    }
};

function destroyNewDialog()
{
    if (dlg != null)
    {
        // Animation for hiding dialog to show the diagram is active
        mxUtils.setPrefixedStyle(dlg.container.style, 'transition', 'all 0.2s linear');
        mxUtils.setPrefixedStyle(dlg.container.style, 'transform', 'scale(0.8,0.8)');
        graph.container.style.opacity = '0';
        dlg.container.style.opacity = '0';
        
        window.setTimeout(function()
        {
            if (dlg != null)
            {
                dlg.container.parentNode.removeChild(dlg.container);
                dlg = null;
                
                mxUtils.setPrefixedStyle(graph.container.style, 'transition', 'all 0.2s linear');
                graph.container.style.opacity = '1';
                updateActions();
                updateBorder();
                fitDiagram(true, true);
                
                quip.apps.enableResizing({maintainAspectRatio: true, minWidth: 100, minHeight: 100});
                
                if (quip.apps.isAppFocused())
                {
                    ui.vHandle.style.display = '';
                }
                
                window.setTimeout(function()
                {
                    mxUtils.setPrefixedStyle(graph.container.style, 'transition', null);
                }, 200);
            }
        }, 200);
    }
};

function setInitialData(data)
{
    var prev = false;

    if (ui != null && ui.session != null)
    {
        prev = ui.session.ignoreNotify;
        ui.session.ignoreNotify = true;
    }

    ui.setFileData(data);
    saveDocument();
    
    if (ui != null && ui.session != null)
    {
        ui.session.ignoreNotify = prev;
    }
};

function createNewDialog()
{
    dlg = new NewDialog(ui, false, false, mxUtils.bind(this, function(xml)
    {
        setInitialData(xml || ui.emptyDiagramXml);
    }), true, function()
    {
        quip.apps.deleteApp();
    }, 'rgb(237, 237, 237)', '#27b5f1', null, '7px 13px 7px 13px', null,
        null, null, null, true);
    
    // Dialog border is rounded
    dlg.container.style.border = '1px solid lightGray';
    dlg.container.style.background = '#fff';
    dlg.container.style.borderRadius = '8px';
    dlg.container.style.borderBox = 'content-box';
    dlg.container.style.overflow = 'hidden';
    dlg.container.style.position = 'absolute';
    dlg.container.style.height = '';
    dlg.container.style.top = '0px';
    dlg.container.style.bottom = '0px';
    dlg.container.style.right = '0px';
    dlg.container.style.left = '0px';

    var left = dlg.container.firstChild;
    left.style.backgroundColor = 'rgb(250, 250, 250)';
    left.style.padding = '5px 0 5px 0';
    left.style.color = '#353535';
    left.style.margin = '0px';
    left.style.top = '44px';
    left.style.left = '0px';
    left.style.borderLeftWidth = '0px';
    left.style.width = '150px';
    left.style.bottom = '40px';
    
    var right = left.nextSibling;
    right.style.borderRightWidth = '0px';
    right.style.borderLeftWidth = '0px';
    right.style.margin = '0px';
    right.style.top = '44px';
    right.style.left = '150px';
    right.style.right = '0px';
    right.style.bottom = '40px';
    
    var buttons = right.nextSibling;
    buttons.style.overflow = 'hidden';
    buttons.style.whiteSpace = 'nowrap';
    buttons.style.margin = '0 6px 6px 6px'
    buttons.style.left = '0px';
    buttons.style.bottom = '0px';
    buttons.style.right = '0px';
    
    // Customization for Quip styling
    var title = document.createElement('div');
    mxUtils.write(title, mxResources.get('selectTemplate'));
    title.style.cssText = 'position:absolute;overflow:hidden;text-overflow:ellipsis;color:#353535;' +
        'font-size:15px;font-weight:bold;text-align:center;padding-top:12px;height:44px;' +
        'box-sizing:border-box;left:0px;right:0px;top:0px;'
     dlg.container.appendChild(title);
    
    var w = quip.apps.getContainerWidth();
    quip.apps.setWidthAndAspectRatio(w, defaultHeight / w);
    container.style.height = defaultHeight + 'px';
    container.style.backgroundImage = 'none';
    graph.container.style.display = 'none';
    container.appendChild(dlg.container);

    quip.apps.disableResizing();
    
    ui.addFileDropHandler([dlg.container]);
    updateActions();
    
    // Adds tooltip to import
    var btns = dlg.container.getElementsByTagName('button');
    
    if (btns != null && btns.length == 3)
    {
        btns[1].setAttribute('title', mxResources.get('import') + ': ' + mxResources.get('gliffy') + ', ' +
                mxResources.get('formatVsdx') + ', ' + mxResources.get('lucidchart') + '...');
    }
};

function cleanupRevisions()
{
    var revs = rootRecord.get('revisions');
    
    if (revs != null)
    {
        while (revs.count() > 1)
        {
            revs.get(0).delete();
        }
    }
};

// Executes after loading viewer.min.js
function createViewer(createUi, fitWindow, onLoad)
{
    doInit(function(theUi)
    {
        // Translates built-in menu commands
        for (var i = 0; i < menuCommands.length; i++)
        {
            if (menuCommands[i].label != null && menuCommands[i].label.charAt(0) == '=')
            {
                var key = menuCommands[i].label.substring(1);
                var postfix = '';
                
                if (key.substring(key.length - 3, key.length) == '...')
                {
                    key = key.substring(0, key.length - 3);
                    postfix = '...';
                }
                
                menuCommands[i].label = mxResources.get(key) + postfix;
            }
        }
        
        if (theUi == null)
        {
            updateActions();

            if (onLoad != null)
            {
                onLoad();
            }
            
            return;
        }
        
        ui = theUi;
        ui.initialConfig = rootRecord.get("config");
        graph = ui.editor.graph;
        graph.model.prefix = guid() + '-';
        graph.cellRenderer.minSvgStrokeWidth = 0.01;
        
        // Ignores hover mouse point for inserts
        graph.isMouseInsertPoint = function()
        {
        	return false;
        };
        
        // Adds CSS to print output, SVG and image export
        ui.editor.fontCss += exportCss;

        // Workaround for sticky mouse down after
        // focus change from other diagram
        if (mxClient.IS_GC && mxClient.IS_MAC)
        {
            graph.addMouseListener(
            {
                mouseDown: function(sender, me) {},
                mouseMove: function(sender, me)
                {
                    if (graph.isMouseDown != (mxEvent.isLeftMouseButton(me.getEvent()) ||
                        mxEvent.isRightMouseButton(me.getEvent())))
                    {
                        graph.getRubberband().reset();
                        graph.graphHandler.reset();
                        graph.isMouseDown = false;
                    }
                },
                mouseUp: function(sender, me) {}
            });
        }

        // Overrides destroy to clean up resources
        var uiDestroy = ui.destroy;
        
        ui.destroy = function()
        {
            if (this.sidebarWindow != null)
            {
                this.sidebarWindow.window.setVisible(false);
                this.sidebarWindow.window.destroy();
                this.sidebarWindow = null;
            }
            
            if (this.formatWindow != null)
            {
                this.formatWindow.window.setVisible(false);
                this.formatWindow.window.destroy();
                this.formatWindow = null;
            }

            if (this.actions.outlineWindow != null)
            {
                this.actions.outlineWindow.destroy();
                this.actions.outlineWindow = null;
            }

            if (this.actions.layersWindow != null)
            {
                this.actions.layersWindow.destroy();
                this.actions.layersWindow = null;
            }

            if (this.actions.tagsWindow != null)
            {
                this.actions.tagsWindow.window.setVisible(false);
                this.actions.tagsWindow.window.destroy();
                this.actions.tagsWindow = null;
            }

            if (this.actions.findWindow != null)
            {
                this.actions.findWindow.window.setVisible(false);
                this.actions.findWindow.window.destroy();
                this.actions.findWindow = null;
            }
            
            if (this.session != null)
            {
                this.session.destroy();
                this.session = null;
            }

            if (this.vHandle != null && this.vHandle.parentNode != null)
            {
                this.vHandle.parentNode.removeChild(this.vHandle);
                this.vHandle = null;
            }
            
            uiDestroy.apply(this, arguments);
        };

        // Redirects isOffline
        ui.isOffline = function()
        {
            return !quip.apps.isOnline();
        };
        
        // Mouse wheel handler to block page scrolling in fullscreen (ignored in MS Edge)
        mxEvent.addMouseWheelListener(mxUtils.bind(this, function(evt, up)
        {
	        if (!isReadOnlyMode() || fullscreen)
	        {
	        	var source = mxEvent.getSource(evt);
	
			    if ((source == graph.container || graph.container.contains(source)) &&
			    	graph.container.style.overflow != 'auto' &&
	            	(fullscreen || (mxEvent.isControlDown(evt) &&
	                !mxClient.IS_MAC) || mxEvent.isMetaDown(evt)))
	            {
	            	// Handles scrolling of container in fullscreen
	                if (!graph.isZoomWheelEvent(evt))
	                {
	                    var t = graph.view.getTranslate();
	                    var step = 40 / graph.view.scale;
	                    
	                    if (!mxEvent.isShiftDown(evt))
	                    {
	                        graph.view.setTranslate(t.x, t.y + ((up) ? step : -step));
	                    }
	                    else
	                    {
	                        graph.view.setTranslate(t.x + ((up) ? -step : step), t.y);
	                    }
	                }
	                
	                mxEvent.consume(evt);
	            }
	            else
	           	{
	           		// Safari and Firefox propagate the event to the outer page if
	           		// the top or bottom is reached in a scrollable container so we
	           		// need to block that but allow if scroll is possible
	           		var temp = source;
	
	           		while (temp != document.body && mxUtils.getCurrentStyle(temp).overflowY != 'auto')
	           		{
	           			temp = temp.parentNode;
	           		}
	           		
	           		if ((temp == document.body && fullscreen) || (temp != document.body &&
	           			((up && temp.scrollTop == 0) ||
	           			(!up && temp.scrollTop >= temp.scrollHeight - temp.clientHeight))))
	       			{
	       				mxEvent.consume(evt);
	       			}
	           	}
			}
        }));
        
        // Closes fullscreen on escape (must be called before handlers are reset)
        // and escape must be ignored in some special cases where its invoked
        // programmatically
        var uiOnKeyPress = ui.onKeyPress;
        
        ui.onKeyPress = function()
        {
            ignoreEscape = true;
            uiOnKeyPress.apply(this, arguments);
            ignoreEscape = false;
        };
        
        var graphReset = graph.reset;
        
        graph.reset = function()
        {
            ignoreEscape = true;
            graphReset.apply(this, arguments);
            ignoreEscape = false;
        };

        var delFunct = ui.actions.get('delete').funct;
        
        ui.actions.get('delete').funct = function()
         {
            ignoreEscape = true;
            delFunct.apply(this, arguments);
            ignoreEscape = false;
        };
        
        var graphEscape = graph.escape;
        
        graph.escape = function()
        {
            if (!graph.isEditing() && !ignoreEscape)
            {
                // Ignores escape if handlers are active
                var inactive = graph.graphHandler.first == null && graph.connectionHandler.first == null;
                
                graph.selectionCellsHandler.handlers.visit(function(key, handler)
                {
                    inactive = inactive && !graph.selectionCellsHandler.isHandlerActive(handler);
                });

                if (inactive)
                {
                    if (fullscreen)
                    {
                        setFullscreen(false);
                    }
                    else
                    {
                        if (ui.menus.findWindow != null)
                        {
                            ui.menus.findWindow.window.setVisible(false);
                        }
                        
                        if (ui.menus.tagsWindow != null)
                        {
                            ui.menus.tagsWindow.window.setVisible(false);
                        }
                        
                        if (ui.actions.layersWindow != null)
                        {
                            ui.actions.layersWindow.window.setVisible(false);
                        }
                        
                        if (ui.actions.outlineWindow != null)
                        {
                            ui.actions.outlineWindow.window.setVisible(false);
                        }
                        
                        if (ui.formatWindow != null)
                        {
                            ui.formatWindow.window.setVisible(false);
                        }
                        
                        if (ui.sidebarWindow != null)
                        {
                            ui.sidebarWindow.window.setVisible(false);
                        }
                        
                        graph.popupMenuHandler.hideMenu();
                        graph.clearSelection();
                        fitDiagram(true);
                    }
                }
            }
            
            graphEscape.apply(this, arguments);
        };

        // Locks unselected cells on mobile
        if (quip.apps.isMobile())
        {
            var graphIsCellLocked = graph.isCellLocked;
            
            graph.isCellLocked = function(cell)
            {
                return !this.isCellSelected(cell) || graphIsCellLocked.apply(this, arguments);
            };
            
            // Overrides cell selection to allow for unselected cells on mobile
            var click = graph.click;
            
            graph.click = function(me)
            {
                if (this.isEnabled() && me.sourceState != null)
                {
                    var cell = me.sourceState.cell;
                    
                    if (cell != null && !graphIsCellLocked.apply(this, [cell]) &&
                        (Math.abs(this.lastMouseX - me.getX()) < this.tolerance &&
                         Math.abs(this.lastMouseY - me.getY()) < this.tolerance))
                    {
                        graph.selectCellForEvent(cell, me.getEvent());
                    }
                }
                else
                {
                    return click.apply(this, arguments);
                }
            };
        }
        
        // Disables centering of graph after iframe resize
        ui.chromelessWindowResize = function() {};
        
        // Overridden to add padding
        ui.chromelessResize = function(autoscale, maxScale, cx, cy, alignTop)
        {
            if (graph.container != null)
            {
                cx = (cx != null) ? cx : 0;
                cy = (cy != null) ? cy : 0;
                
                var bds = (graph.pageVisible) ? graph.view.getBackgroundPageBounds() : graph.getGraphBounds();
                var scroll = mxUtils.hasScrollbars(graph.container);
                var tr = graph.view.translate;
                var s = graph.view.scale;
                
                // Normalizes the bounds
                var b = mxRectangle.fromRectangle(bds);
                b.x = b.x / s - tr.x;
                b.y = b.y / s - tr.y;
                b.width /= s;
                b.height /= s;
                
                var st = graph.container.scrollTop;
                var sl = graph.container.scrollLeft;
                var sb = 0; //(mxClient.IS_QUIRKS || document.documentMode >= 8) ? 20 : 14;
                var cw = graph.container.offsetWidth - sb;
                var ch = graph.container.offsetHeight - sb;
                
                var ns = (autoscale) ? Math.max(0.3, Math.min(maxScale || 1, cw / b.width)) : s;
                var dx = ((cw - ns * b.width) / 2) / ns;
                var dy = (fullscreen) ? (((ch - ns * b.height) / this.lightboxVerticalDivider) / ns) : padding / ns;
                
                if (alignTop)
                {
                    dy = Math.max(dy, padding / ns);
                }
                
                if (scroll)
                {
                    dx = Math.max(dx, 0);
                    dy = Math.max(dy, 0);
                }

                if (scroll || (bds.width < cw && bds.height < ch))
                {
                    graph.view.scaleAndTranslate(ns, Math.floor(dx - b.x), Math.floor(dy - b.y));
                    graph.container.scrollTop = st * ns / s;
                    graph.container.scrollLeft = sl * ns / s;
                }
                else if (cx != 0 || cy != 0)
                {
                    var t = graph.view.translate;
                    var ty = 
                    graph.view.setTranslate((bds.width < cw) ? Math.floor(dx - b.x) : Math.floor(t.x + cx / s),
                            (bds.height < ch) ? Math.floor(dy - b.y) :
                                ((alignTop) ? Math.floor(dy - b.y) : Math.floor(t.y + cy / s)));
                }
            }
        };

        // Creates vertical handle
        ui.vHandle = document.createElement('div');
        ui.vHandle.className = 'geVerticalHandle';

        // Event catching on outer document
        var catcher = null;
        var bounds = null;
        var lastY = null;
        
        function addCatcher()
        {
            catcher = ui.createDiv('background');
            catcher.style.cssText = 'position:absolute;background:transparent;top:0px;left:0px;right:0px;bottom:0px;z-index:99999;';
            document.body.appendChild(catcher);
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(catcher));

            mxEvent.addGestureListeners(catcher, function(evt)
            {
                // see below
            }, function(evt)
            {
                if (lastY != null)
                {
                    var dy = mxEvent.getClientY(evt) - lastY;
                    var h = Math.max(50, bounds.height + dy);
                    quip.apps.setWidthAndAspectRatio(bounds.width, h / bounds.width);
                    container.style.height = h + 'px';
                }
            }, function()
            {
                lastY = null;
                removeCatcher();
            });
        };
        
        function removeCatcher()
        {
              quip.apps.removeDetachedNode(ReactDOM.findDOMNode(catcher));
              catcher.parentNode.removeChild(catcher);
        };
        
        mxEvent.addGestureListeners(ui.vHandle, function(evt)
        {
            bounds = quip.apps.getCurrentDimensions();
            lastY = mxEvent.getClientY(evt);
            addCatcher();
        });

        // Workaround for spinner and status position
        var oldSpin = ui.spinner.spin;
        
        ui.spinner.spin = function(c, message)
        {
            var result = oldSpin.apply(ui.spinner, [container, message]);
            
            if (ui.spinner.status != null)
            {
                ui.spinner.status.style.marginTop = '70px';
                ui.spinner.status.style.left = '50%';
                ui.spinner.status.style.top = '50%';
            }
            
            return result;
        };
        
        // Handles open file via drop to splash screen
        ui.openLocalFile = function(data, name, temp)
        {
            if (dlg != null)
            {
                setInitialData(data);
            }
        };
        
        // Handles Quip exported files (currently only current XML for import)
        var uiValidateFileData = ui.validateFileData;
        
        ui.validateFileData = function(data)
        {
            if (data != null && data.substring(0, 9) == '{"user":"')
            {
                try
                {
                    var obj = JSON.parse(data);
                    data = obj.current;
                }
                catch (e)
                {
                    // ignore
                }
            }
            
            return uiValidateFileData.apply(this, [data]);
        };
        
        // Make available for resolving DOM nodes
        window.graph = graph;
        
        // Adds/modifies actions and menus
        ui.actions.get('save').setEnabled(false);
        ui.actions.get('insertText').label = mxResources.get('text');
        ui.actions.get('editDiagram').label = mxResources.get('formatXml') + '...';
        ui.actions.get('insertRectangle').label = mxResources.get('rectangle');
        ui.actions.get('insertEllipse').label = mxResources.get('ellipse');
        ui.actions.get('insertRhombus').label = mxResources.get('rhombus');
        ui.actions.get('insertImage').label = mxResources.get('image') + '...';
        ui.actions.get('insertLink').label = mxResources.get('link') + '...';
        ui.actions.get('createShape').label = mxResources.get('shape') + '...';
        ui.actions.get('outline').label = mxResources.get('outline') + '...';
        ui.actions.get('layers').label = mxResources.get('layers') + '...';
        ui.actions.get('keyboardShortcuts').funct = function()
        {
            quip.apps.openLink('https://www.draw.io/shortcuts.svg');
        };
        ui.actions.get('support').funct = function()
        {
            quip.apps.openLink('https://desk.draw.io/support/solutions/articles/16000075852');
        };

//        ui.actions.put('addComment', new Action('Add comment...', function()
//        {
//            var cell = graph.getSelectionCell();
//            
//            if (cell != null)
//            {
//                var entry = {pageId: ui.currentPage.getId(), cellId: cell.id};
//                var comment = rootRecord.get('comments').add(entry);
//                console.log('comment', entry, comment);
//                quip.apps.showComments(comment.getId());
//            }
//        }));
        ui.actions.put('fit', new Action(mxResources.get('fit'), function()
        {
            graph.popupMenuHandler.hideMenu();
            fitDiagram(true);
        }));
        ui.actions.put('comment', new Action(mxResources.get('comment') + '...', function()
        {
            setFullscreen(false);
            quip.apps.showComments(rootRecord.getId());
        }));
        ui.actions.put('preferences', new Action(mxResources.get('preferences') + '...', function()
        {
            graph.popupMenuHandler.hideMenu();
            showConfigureDialog();
        }));
        ui.actions.put('insertPage', new Action(mxResources.get('page'), function()
        {
            ui.insertPage();
            fitDiagram();
            updateActions();
        }));
        ui.actions.put('fullscreen', new Action(mxResources.get('fullscreen'), function()
        {
            setFullscreen(true);
        }));
        ui.actions.put('exitFullscreen', new Action(mxResources.get('done'), function()
        {
            if (graph.pageVisible)
            {
                ui.actions.get('pageView').funct();
            }
            
            setFullscreen(false);
        }));
        ui.actions.put('debug', new Action('Debug', function()
        {
            function getDataArray(record)
            {
                var result = [];
                
                for (var i = 0; i < record.count(); i++)
                {
                    result.push(record.get(i).get("data"));
                }
                
                return result;
            };
            
            console.log('ui', ui);
            console.log('root', rootRecord);
            console.log('edits', rootRecord.get("edits").getId(), getDataArray(rootRecord.get("edits")));
            console.log('revisions', getDataArray(rootRecord.get("revisions")))
            console.log('storage', rootRecord.get("storage"));
            console.log('config', rootRecord.get("config"));
            console.log('snapshot', rootRecord.get("snapshot"));
            console.log('user', quip.apps.getUserPreferences().getForKey('settings'));
        }));
        ui.actions.put('refresh', new Action('Refresh', function()
        {
            graph.refresh();
        }));
        ui.actions.put('importFile', new Action('File...', function()
        {
            graph.popupMenuHandler.hideMenu();
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            
            mxEvent.addListener(input, 'change', function()
            {
                if (input.files != null)
                {
                    // Using null for position will disable crop of input file
                    ui.importFiles(input.files, null, null, ui.maxImageSize);
                }
            });

            input.click();
        }));
        ui.actions.put('importCsv', new Action(mxResources.get('csv') + '...', function()
        {
            graph.popupMenuHandler.hideMenu();
            ui.showImportCsvDialog();
        }));
        ui.actions.put('importText', new Action(mxResources.get('text') + '...', function()
        {
            var dlg = new ParseDialog(ui, 'Insert from Text');
            ui.showDialog(dlg.container, 620, 420, true, false);
            dlg.init();
        }));
        ui.actions.put('formatSql', new Action(mxResources.get('formatSql') + '...', function()
        {
            var dlg = new ParseDialog(ui, 'Insert from Text', 'formatSql');
            ui.showDialog(dlg.container, 620, 420, true, false);
            dlg.init();
        }));
        
        if (EditorUi.enablePlantUml)
        {
            ui.actions.put('plantUml', new Action(mxResources.get('plantUml') + '...', function()
            {
                var dlg = new ParseDialog(ui, 'Insert from Text', 'plantUml');
                ui.showDialog(dlg.container, 620, 420, true, false);
                dlg.init();
            }));
        }

        ui.actions.put('lockApp', new Action(mxResources.get('lockUnlock'), function()
        {
            setFullscreen(false, true);
            
            toggleLocked(null, function()
            {
                if (!locked)
                {
                    setFullscreen(true, true);
                }
            });
        }));
        ui.actions.put('deleteApp', new Action(mxResources.get('delete') + '...', function()
        {
            ui.confirm(mxResources.get('areYouSure'), function()
            {
                quip.apps.deleteApp();
            });
        }));
        ui.actions.put('toggleShapes', new Action(mxResources.get('shapes') + '...', toggleShapes));
        ui.actions.put('toggleFormat', new Action(mxResources.get('format') + '...', toggleFormat));
        var addInsertItem = function(menu, parent, title, method)
        {
            menu.addItem(title, null, mxUtils.bind(this, function()
            {
                var dlg = new CreateGraphDialog(ui, title, method);
                ui.showDialog(dlg.container, 620, 420, true, false);
                // Executed after dialog is added to dom
                dlg.init();
            }), parent);
        };

        ui.menus.put('diagram', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            ui.menus.addMenuItems(menu, ['comment', '-', 'outline', 'layers', '-', 'find', 'tags', '-'], parent);
            ui.menus.addSubmenu('export', menu, parent);
            ui.menus.addMenuItems(menu, ['preferences', '-'], parent);
            ui.menus.addSubmenu('help', menu, parent);
            ui.menus.addMenuItems(menu, ['-', 'deleteApp'], parent);
        })));

        ui.menus.put('export', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            ui.menus.addMenuItems(menu, ['exportPng', 'exportJpg', 'exportSvg', '-', 'exportPdf', 'exportVsdx', '-',
                                         'exportHtml', 'exportXml', 'exportUrl', '-'], parent);
            ui.menus.addSubmenu('embed', menu, parent);
        })));

        ui.menus.put('insertAdvanced', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            ui.menus.addMenuItems(menu, ['importText', 'createShape', 'plantUml', '-', 'importCsv',
                                         'formatSql', 'editDiagram', '-', 'insertPage'], parent);
        })));
        
        mxResources.parse('insertLayout=' + mxResources.get('layout'));
        mxResources.parse('insertAdvanced=' + mxResources.get('advanced'));
        
        ui.menus.put('insert', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            ui.menus.addMenuItems(menu, ['insertRectangle', 'insertEllipse', 'insertRhombus', '-', 'insertText',
                                         'insertLink', '-', 'insertImage', 'insertTemplate', '-'], parent);
            ui.menus.addSubmenu('insertLayout', menu, parent);
            ui.menus.addSubmenu('insertAdvanced', menu, parent);
            ui.menus.addMenuItems(menu, ['-', 'importFile'], parent);
        })));

        var methods = ['horizontalFlow', 'verticalFlow', '-', 'horizontalTree', 'verticalTree',
                       'radialTree', '-', 'organic', 'circle'];
        
        ui.menus.put('insertLayout', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            for (var i = 0; i < methods.length; i++)
            {
                if (methods[i] == '-')
                {
                    menu.addSeparator(parent);
                }
                else
                {
                    addInsertItem(menu, parent, mxResources.get(methods[i]) + '...', methods[i]);
                }
            }
        })));
        
        ui.menus.put('options', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            ui.menus.addMenuItems(menu, ['grid', 'guides', '-', 'connectionArrows',
                 'connectionPoints', '-', 'copyConnect', 'collapseExpand'], parent);
        })));

        ui.menus.put('embed', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            ui.menus.addMenuItems(menu, ['embedImage', 'embedSvg', '-', 'embedHtml', 'embedIframe'], parent);
        })));

        ui.menus.put('help', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            // No translation for menu item since help is english only
            var item = menu.addItem('Search:', null, null, parent, null, null, false);
            item.style.backgroundColor = (uiTheme == 'dark') ? '#505759' : 'whiteSmoke';
            item.style.cursor = 'default';
            
            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('size', '25');
            input.style.marginLeft = '8px';

            mxEvent.addListener(input, 'keydown', mxUtils.bind(this, function(e)
            {
                var term = mxUtils.trim(input.value);
                
                if (e.keyCode == 13 && term.length > 0)
                {
                    ui.openLink('https://desk.draw.io/support/search/solutions?term=' +
                        encodeURIComponent(term));
                    input.value = '';
                    
                    if (ui.menubar != null)
                    {
                        window.setTimeout(mxUtils.bind(this, function()
                        {
                            ui.menubar.hideMenu();
                        }), 0);
                    }
                }
                else if (e.keyCode == 27)
                {
                    input.value = '';
                }
            }));
            
            item.firstChild.nextSibling.appendChild(input);
            
            mxEvent.addGestureListeners(input, function(evt)
            {
                if (document.activeElement != input)
                {
                    input.focus();
                }
                
                mxEvent.consume(evt);
            }, function(evt)
            {
                mxEvent.consume(evt);
            }, function(evt)
            {
                mxEvent.consume(evt);
            });
            
            window.setTimeout(function()
            {
                input.focus();
            }, 0);
            
            ui.menus.addMenuItems(menu, ['-', 'quickStart', 'keyboardShortcuts', 'support', '-', 'about'], parent);
        })));
        
        // Needed for creating elements in Format panel
        ui.toolbar = ui.createToolbar(ui.createDiv('geToolbar'));
        ui.defaultLibraryName = mxResources.get('untitledLibrary');

        // Fixes event handling for popup menu in Quip
        var popupMenuHandlerPopup = graph.popupMenuHandler.popup;
        
        graph.popupMenuHandler.popup = function()
        {
            popupMenuHandlerPopup.apply(this, arguments);
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.div));
        };
        
        if (preview == null)
        {
            quip.apps.enableResizing({maintainAspectRatio: true, minWidth: 100, minHeight: 100});
        }

        var undoMgr = ui.editor.undoManager;
        graph.getSelectionModel().addListener(mxEvent.CHANGE, updateActions);
        undoMgr.addListener(mxEvent.ADD, updateActions);
        undoMgr.addListener(mxEvent.UNDO, updateActions);
        undoMgr.addListener(mxEvent.REDO, updateActions);
        undoMgr.addListener(mxEvent.CLEAR, updateActions);
        updateActions();
        
        // Resets view after page change
        ui.editor.addListener('pageSelected', function()
        {
            if (!fullscreen)
            {
                fitDiagram(true, true);
            }
        });
        
        ui.addListener('pageViewChanged', function()
        {
            fitDiagram(true);
        });

        ui.reloadFromRecord = function(forceUpdate)
        {
            var tempConfig = rootRecord.get("config");

            if (!quip.apps.isAppFocused())
            {
                if (ui.initialConfig != tempConfig)
                {
                    ui.initialConfig = tempConfig;
                    forceUpdate = true;
                    
                    viewerConfig = (tempConfig != null && tempConfig.length > 0) ? JSON.parse(tempConfig) : {};
                    border = (viewerConfig.border != null) ? viewerConfig.border : 0;
                    padding = (viewerConfig.padding != null) ? viewerConfig.padding : padding;
                    locked = (viewerConfig.locked != null) ? viewerConfig.locked : false;
                }
                
                if (forceUpdate)
                {
                    updateActions();
                    updateBorder();
                    fitDiagram(forceUpdate);
                }
            }
            else
            {
                viewerConfig = (tempConfig != null && tempConfig.length > 0) ? JSON.parse(tempConfig) : {};
                locked = viewerConfig.locked;
            }
            
            if (ui != null && ui.editor.editable == locked)
            {
                toggleLocked(true);
            }
        };

        initSession(fitWindow)
        
        if (ui.session == null)
        {
            if (!isDocumentEditable())
            {
                var w = quip.apps.getContainerWidth();
                quip.apps.setWidthAndAspectRatio(w, 40 / w);
                container.style.backgroundImage = '';
                container.style.height = '40px';
                var test = document.createElement('div');
                var error = document.createElement('div');
                error.style.cssText = 'text-align:center;position:absolute;left:0px;right:0px;top:0px;bottom:0px;';
                error.setAttribute('id', 'error');
                error.innerHTML = '<div style="background:#fafafa;border:#c0c0c0 solid 1px;' +
                    'padding:6px 12px 6px 12px;display:inline-block;border-radius:8px;color:#808080;">' +
                    'Unsupported browser</div>';
                container.appendChild(error);
                
                // Block resizing until diagram was created
                quip.apps.disableResizing();
                updateActions();
            }
            else if (dlg == null && !isDocumentTemplate())
            {
                createNewDialog();
            }
        }
        else if (rootRecord.get("snapshot") == null && !viewerConfig.noPreview)
        {
            var edits = rootRecord.get('edits');
            
            if (edits != null && edits.count() > 0)
            {
                try
                {
                    // Updates snapshot if last change is older than 30 seconds
                    // to avoid too many snapshots to be created when the page
                    // is loaded while the diagram is being edited
                    if (new Date().getTime() - JSON.parse(edits.get(
                        edits.count() - 1).get('data')).timestamp > 30000)
                    {
                        updateSnapshot();
                    }
                }
                catch (e)
                {
                    // ignore
                }
            }
        }
        
        ui.vHandle.style.display = (document.getElementById('error') == null && dlg == null &&
            quip.apps.isAppFocused() && !fullscreen) ? '' : 'none';
        container.appendChild(ui.vHandle);
        quip.apps.addDetachedNode(ReactDOM.findDOMNode(ui.vHandle));
        clearSelection();

        if (onLoad != null)
        {
            onLoad();
        }
    }, function()
    {
        return (createUi) ? new EditorUi(new Editor(true, null, null,
        	null, isDocumentEditable()), container, true) : null;
    });
} // end createViewer

function updateSnapshot()
{
    if (dlg == null && (ui.pages == null || ui.currentPage == ui.pages[0]))
    {
        // Math is currently not supported
        if (graph.mathEnabled)
        {
            debug('invalidate snapshot', rootRecord.getId());
            rootRecord.clear('snapshot');
            
            return;
        }
        
        var snapshot = rootRecord.get("snapshot");
        snapshotObj = null;
        
        try
        {
            snapshotObj = (snapshot != null) ? JSON.parse(snapshot) : null;
        }
        catch (e)
        {
            // ignore
        }
        
        if (snapshotObj != null && snapshotObj.edits == rootRecord.get("edits").count())
        {
            return;
        }
        
        var exp = graph.createSvgImageExport();
        
        // Overrides rendering to add tooltips
        var expDrawCellState = exp.drawCellState;

        exp.drawCellState = function(state, canvas)
        {
            var svgDoc = canvas.root.ownerDocument;
            var g = svgDoc.createElementNS(mxConstants.NS_SVG, 'g');

            // Temporary replaces root for content rendering
            var prev = canvas.root;
            prev.appendChild(g);
            canvas.root = g;
            
            expDrawCellState.apply(this, arguments);
            
            // Adds tooltip if group is not empty
            if (g.firstChild == null)
            {
                g.parentNode.removeChild(g);
            }
            else
            {
                var tooltip = graph.getTooltipForCell(state.cell);
                
                if (tooltip != null && tooltip.length > 0)
                {
                    var title = svgDoc.createElementNS(mxConstants.NS_SVG, 'title');
                    mxUtils.write(title, tooltip);
                    g.appendChild(title);
                }
            }
            
            // Restores previous root
            canvas.root = prev;
        };
        
        var bg = graph.background;
        
        if (bg == mxConstants.NONE)
        {
            bg = null;
        }
        
        var svgRoot = graph.getSvg(bg, 1, 0, false, false, true, true, exp);

        if (graph.shadowVisible)
        {
            ui.editor.graph.addSvgShadow(svgRoot);
        }
        
        debug('update snapshot', rootRecord.getId());
        var data = {"svg": mxUtils.getXml(svgRoot), "timestamp": new Date().getTime(),
              "edits": rootRecord.get("edits").count(), "math": graph.mathEnabled,
              "shadow": graph.shadowVisible};
        rootRecord.set("snapshot", JSON.stringify(data));
    }
};

quip.apps.initialize(
{
    menuCommands: menuCommands,
    initializationCallback: function(root, params)
    {
        rootRecord = quip.apps.getRootRecord();
        var revs = rootRecord.get("revisions");
        var edits = rootRecord.get("edits");

        if (revs != null && edits != null)
        {
            var tempConfig = rootRecord.get("config");
            viewerConfig = (tempConfig != null && tempConfig.length > 0) ? JSON.parse(tempConfig) : {};
            border = (viewerConfig.border != null) ? viewerConfig.border : 0;
            padding = (viewerConfig.padding != null) ? viewerConfig.padding : padding;
            locked = (viewerConfig.locked != null) ? viewerConfig.locked : false;

            rootRecord.listen(rootRecordListener);
            edits.listen(editsListener);
            revs.listen(revsListener);

            root.innerHTML = initialHtml;
            container = document.getElementById('graph');
            var snapshot = rootRecord.get("snapshot");
            snapshotObj = null;
            
            try
            {
                snapshotObj = (snapshot != null) ? JSON.parse(snapshot) : null;
            }
            catch (e)
            {
                // ignore
            }
            
            if (snapshotObj != null && (snapshotObj.edits != rootRecord.get("edits").count() || snapshotObj.math))
            {
                debug('removing old snapshot');
                rootRecord.clear('snapshot');
                snapshotObj = null;
            }
            
            if (snapshotObj != null && !viewerConfig.noPreview)
            {
                container.style.display = 'none';

                preview = document.createElement('div');
                preview.setAttribute('id', 'preview');
                preview.style.cssText = 'text-align:center;padding:' + padding + 'px;overflow:auto;cursor:pointer;' +
                    'width:100%;visibility:hidden;border: 1px solid ' + ((border > 0) ? 'lightGray' : 'transparent');
                preview.innerHTML = snapshotObj.svg;

                var svg = preview.getElementsByTagName('svg')[0];
                var w = parseInt(svg.getAttribute('width'));
                var h = parseInt(svg.getAttribute('height'));
                preview.style.backgroundColor = svg.style.backgroundColor;
                svg.style.backgroundColor = '';
                svg.removeAttribute('height');
                
                // Crisp rendering of edges
                svg.setAttribute('viewBox', '-0.5 -0.5 ' + w + ' ' + h);
                                 
                // Default for text blocks in static SVG and avoid clipping
                svg.style.textAlign = 'left';
                var cw = quip.apps.getContainerWidth();
                
                if (quip.apps.isMac() || quip.apps.isIOs() || quip.apps.isAndroid() ||
                    (navigator.userAgent.indexOf('AppleWebKit/') >= 0 &&
                    navigator.userAgent.indexOf('Chrome/') < 0 &&
                    navigator.userAgent.indexOf('Edge/') < 0))
                {
                    svg.getElementsByTagName('g')[0].removeAttribute('filter');
                }
                
                var mz = (viewerConfig.maxZoom != null) ? viewerConfig.maxZoom : defaultMaxZoom;
                var f = Math.min(mz, cw / (w + 2 * padding));
                root.appendChild(preview);

                if (viewerConfig.fixedZoom)
                {
                    // Matches current fixedZoom view
                    preview.style.padding = padding + 'px 0 0 0';
                    svg.setAttribute('width', Math.ceil(w * mz));
                    svg.setAttribute('height', Math.ceil(h * mz + 1));

                    var ch = Math.max(50, Math.ceil(h * mz + Math.max(2, 2 * Math.max(1, padding + 2))));
                    preview.style.height = (ch + 4) + 'px';
                    quip.apps.setWidthAndAspectRatio(cw, (ch + 4) / cw);
                }
                else
                {
                    preview.style.paddingBottom = Math.max(1, padding - ((snapshotObj.shadow) ? 10 : 5)) + 'px';
                    svg.style.maxWidth = Math.ceil(w * mz) + 'px';
                    svg.removeAttribute('width');
                    svg.style.width = '100%';

                    quip.apps.setWidthAndAspectRatio(cw, (h * f + Math.max(2, 2 * padding) + 2) / cw);
                }

                svg.addEventListener('mousedown', function(evt)
                {
                    var target = evt.target;
                    
                    while (target != null && target.nodeName.toLowerCase() != 'a')
                    {
                        target = target.parentNode;
                    }
                    
                    if (target != null)
                    {
                        ignoreFocus = true;
                    }
                    
                    // Disables text selection
                    return false;
                });

                svg.addEventListener('click', function(evt)
                {
                    var target = evt.target;
                    
                    while (target != null && target.nodeName.toLowerCase() != 'a')
                    {
                        target = target.parentNode;
                    }
                    
                    if (target != null)
                    {
                        var href = target.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || target.getAttribute('href');

                        if (href.substring(0, 13) == 'data:page/id,')
                        {
                            // Handles links to pages
                            initialPageId = href.substring(13);
                        }
                        else
                        {
                            quip.apps.openLink(href);
                        }

                        evt.preventDefault();
                        ignoreFocus = false;
                        hidePreview();
                    }
                });
                
                preview.style.visibility = 'visible';

                main(false/*, function()
                {
                    // NOTE: Math is currently not supported - this code is not used
                    if (quip.apps.isOnline() && snapshotObj.math)
                    {
                        Editor.MathJaxRender(preview);
                        
                        // Workaround for mathjax rendering not visible with translate
                        var fo = svg.getElementsByTagName('foreignObject');
                        
                        for (var i = 0; i < fo.length; i++)
                        {
                            var g = fo[i].parentNode.parentNode;
                            fo[i].firstChild.style.width = '100%';
                            var tr = g.getAttribute('transform');
                            var coords = tr.substring(10, tr.length - 1).split(',');
                            fo[i].setAttribute('x', coords[0]);
                            fo[i].setAttribute('y', coords[1]);
                            g.removeAttribute('transform');
                        }
                    }
                }*/);
                
                debug('using snapshot', rootRecord.getId());
            }
            else
            {
                main(true);
            }
        }
        else
        {
            root.innerHTML = '<div style="text-align:center;"><div style="background:#fafafa;border:#c0c0c0 solid 1px;' +
                'padding:6px 12px 6px 12px;display:inline-block;border-radius:8px;color:#808080;">' +
                'Diagram not found</div></div>';
            var w = quip.apps.getContainerWidth();
            quip.apps.setWidthAndAspectRatio(w, 40 / w);
        }
    }
});

function updateBorder()
{
    graph.container.style.border = (fullscreen) ? 'none' : '1px solid ' +
      ((ui.isDiagramEmpty() || border > 0) ? 'lightGray' : 'transparent');
};

// Update action states
function updateActions()
{
    var cmds = [];
    
    if (isDocumentEditable())
    {
        if (dlg == null)
        {
            cmds = cmds.concat([quip.apps.DocumentMenuCommands.MENU_MAIN,
                        quip.apps.DocumentMenuCommands.SEPARATOR,
                        "shapes", "format",
                        quip.apps.DocumentMenuCommands.SEPARATOR,
                        "insert", "delete",
                        quip.apps.DocumentMenuCommands.SEPARATOR,
                        "undo", "redo",
                        quip.apps.DocumentMenuCommands.SEPARATOR,
                        "fit", "zoomIn", "zoomOut", "fullscreen"]);
            
            if (!isReadOnlyMode())
            {
                cmds = cmds.concat([quip.apps.DocumentMenuCommands.SEPARATOR,
                                    ((locked) ? "unlock" : "lock")]);
            }
        }
        else
        {
            cmds.push('help');
        }
    }
    else
    {
        cmds = [quip.apps.DocumentMenuCommands.MENU_MAIN];
        
        if (document.getElementById('error') == null)
        {
            cmds = cmds.concat([quip.apps.DocumentMenuCommands.SEPARATOR,
                "fit", "zoomIn", "zoomOut", "fullscreen"]);
            
            if (!isReadOnlyMode())
            {
                cmds = cmds.concat([quip.apps.DocumentMenuCommands.SEPARATOR,
                                    ((locked) ? "unlock" : "lock")]);
            }
        }
    }
    
    if (ui != null && ui.pages != null && ui.pages.length > 1)
    {
        cmds = cmds.concat([quip.apps.DocumentMenuCommands.SEPARATOR, "prevPage", "nextPage"]);
    }

    if (domain == 'test.draw.io')
    {
        cmds = cmds.concat([quip.apps.DocumentMenuCommands.SEPARATOR, "debug"]);
    }
    
    quip.apps.updateToolbar({toolbarCommandIds: cmds});
    cmds = (preview != null || document.getElementById('error') != null) ? ['about', 'preferences', 'outline', 'layers', 'find',
                                'tags', 'export', 'embed', 'print'] : [];
    var deleteEnabled = true;
    
    if (isDocumentEditable() && ui != null && graph != null)
    {
        if (graph.isSelectionEmpty() && ui.pages != null && ui.pages.length == 1 && ui.isDiagramEmpty())
        {
            cmds.push("delete");
            deleteEnabled = false;
        }
        
        if (!ui.canUndo())
        {
            cmds.push('undo');
        }

        if (!ui.canRedo())
        {
            cmds.push('redo');
        }
    }
    else
    {
        cmds = cmds.concat(["format", "shapes"]);
    }
    
    if (document.getElementById('error') != null)
    {
        cmds = cmds.concat(["fit", "zoomIn", "zoomOut", "fullscreen"]);
    }
    
    // Allowed if locked to disable locking
    if (!quip.apps.isDocumentEditable() || isDocumentTemplate())
    {
        cmds.push("preferences");
    }
    
    if (ui != null)
    {
        ui.actions.get('delete').setEnabled(deleteEnabled);
        
        // Safari cannot save binary files and export images without server-side
        // For image and text files a workaround shows the data in an mxWindow
        if (!ui.useCanvasForExport)
        {
            var imageExportEnabled = quip.apps.isOnline();
            ui.actions.get('exportPng').setEnabled(imageExportEnabled);
            ui.actions.get('exportJpg').setEnabled(imageExportEnabled);
            
            if (!imageExportEnabled)
            {
                cmds.push('exportPng');
                cmds.push('exportJpg');
            }
        }

        // Cannot download binary file in native apps and Safari
        if ((quip.apps.isNative != null && quip.apps.isNative()) || mxClient.IS_SF)
        {
            ui.actions.get('exportVsdx').setEnabled(false);
            cmds.push('exportVsdx');
        }

        // Cannot call print or open new window in native apps
        if ((quip.apps.isNative != null && quip.apps.isNative()) ||
       		(Editor.config != null && Editor.config.pdfExport != null &&
            !Editor.config.pdfExport))
        {
            ui.actions.get('exportPdf').setEnabled(false);
            cmds.push('exportPdf');
            ui.actions.get('print').setEnabled(false);
            cmds.push('print');
        }
        
        // Fullscreen does not work on mobile
        if (quip.apps.isMobile())
        {
            ui.actions.get('fullscreen').setEnabled(false);
            cmds.push('fullscreen');
        }
        
        // Fullscreen does not work on mobile
        if (ui.actions.get('plantUml') == null)
        {
            cmds.push('plantUml');
        }
    }
    
    quip.apps.updateToolbarCommandsState(cmds, []);
};

function createCmd(id, title)
{
    return {
        id: id,
        label: title,
        handler: () =>
        {
            var action = ui.actions.get(id);

            if (action != null)
            {
                graph.popupMenuHandler.hideMenu();
                action.funct();
            }
        }
    };
};

function addLayout(method, title)
{
    return {
        id: method,
        label:title,
        handler: () => {
            var dlg = new CreateGraphDialog(ui, title, method);
            ui.showDialog(dlg.container, 620, 420, true, false);
            // Executed after dialog is added to dom
            dlg.init();
        }
    };
}

/**
 * 
 */
var WrapperWindow = function(editorUi, title, x, y, w, h, fn)
{
    var graph = editorUi.editor.graph;
    
    var div = document.createElement('div');
    div.className = 'geSidebarContainer';
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.border = '1px solid whiteSmoke';
    div.style.overflowX = 'hidden';
    div.style.overflowY = 'auto';
    
    fn(div);

    this.window = new mxWindow(title, div, x, y, w, h, true, true);
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
    this.window.setVisible(true);
    
    this.window.setLocation = function(x, y)
    {
        var iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var ih = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        
        x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
        y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

        if (this.getX() != x || this.getY() != y)
        {
            mxWindow.prototype.setLocation.apply(this, arguments);
        }
    };
};

/**
 * TODO: Migrate to DiffSync (see DiffSync.js, DrawioFileSync.js) in drawio repo.
 * There are known issues with this implementation of edit replay wrt to indices.
 */
var Session = function(graph, sessionId, record, cache)
{
    this.localEdits = [];
    this.lastCount = 0;
    this.allEdits = {};
    this.codec = new mxCodec();
    this.codec.ui = ui;
    this.graph = graph;
    this.model = graph.model;
    this.sessionId = sessionId;
    this.record = record;
};

Session.prototype.linefeed = '&#xa;';

Session.prototype.ignoreUpdates = false;

Session.prototype.ignoreNotify = false;

Session.prototype.init = function(lastEdit, fit)
{
    this.codec.lookup = function(id)
    {
        return graph.model.getCell(id);
    };

    var self = this;
    
    // Overrides command history to ignore remote changes
    this.undoListener = ui.editor.undoListener;
    
    ui.editor.undoListener = mxUtils.bind(this, function(sender, evt)
    {
        if (!this.ignoreNotify)
        {
            self.undoListener.apply(ui.editor, arguments);
        }
    });
    
    // Overrides execute to replace cell references in changes
    this.execute = this.model.execute;
    
    this.model.execute = function(change)
    {
        self.replaceRefs(change);
        self.execute.apply(this, arguments);
    };

    // Writes model changes to Quip data model
    var counter = 0;
    
    this.notifyListener = mxUtils.bind(this, function(sender, evt)
    {
        if (!this.ignoreNotify)
        {
            destroyNewDialog();

            if (!isDocumentTemplate() && isDocumentEditable())
            {
                var edit = evt.getProperty('edit');
                var encodedChanges = this.encodeChanges(edit.changes, edit.undone);
                
                if (encodedChanges.length > 0)
                {
                    var entry = {id: this.sessionId + '-' + (counter++), edit: edit};
                    this.localEdits.push(entry);
    
                    var xml = '<edit>' + encodedChanges + '</edit>';
                    var user = quip.apps.getViewingUser();
                    var pageId = ui.currentPage.getId();
    
                    this.ignoreUpdates = true;
                    var rec = {data: JSON.stringify({"id": entry.id, "userid": user.getId(), "pageid": pageId,
                        "username": user.getName(), "timestamp": new Date().getTime(), "data": xml})};
                    this.record.add(rec);
                    debug('added edit', rec, xml);
    
                    window.setTimeout(mxUtils.bind(this, function()
                    {
                        this.ignoreUpdates = false;
                    }), 0);
                }
            }
        }
        
        updateContainerSize();
    });

    this.graph.model.addListener(mxEvent.NOTIFY, this.notifyListener);

    // Converts diagram from 2nd generation to 3rd generation
    if (lastEdit != null && lastEdit != "")
    {
        this.convertDiagram(lastEdit);
    }
    
    this.recordListener = mxUtils.bind(this, function()
    {
        if (!this.ignoreUpdates && this.record.count() > 0)
        {
            this.processEdits(this.record);
        }
    });
    
    this.record.listen(this.recordListener);
    
    if (this.record.count() > 0)
    {
        this.processEdits(this.record, true, fit);
    }
    else
    {
        updateBorder();
        fitDiagram(true, true);
    }
};


/**
 * Function: destroy
 * 
 * Destroys this session.
 */
Session.prototype.destroy = function()
{
    if (this.undoListener != null && ui != null)
    {
        ui.editor.undoListener = this.undoListener;
        this.undoListener = null;
    }
    
    if (this.execute != null)
    {
        this.model.execute = this.execute;
        this.execute = null;
    }
    
    if (this.notifyListener != null)
    {
        this.graph.model.removeListener(this.notifyListener);
        this.notifyListener = null;
    }

    if (this.recordListener != null)
    {
        this.record.unlisten(this.recordListener);
        this.recordListener = null;
    }
};

Session.prototype.reset = function()
{
    this.localEdits = [];
    this.lastCount = 0;
    this.allEdits = {};
    
    if (this.record.count() > 0)
    {
        this.processEdits(this.record, true);
    }
    else
    {
        updateBorder();
        fitDiagram(true, true);
    }
};

Session.prototype.convertDiagram = function(lastEdit)
{
    debug('converting diagram');
    var active = false;
     
    // Deletes all and processes pending edits
    while (this.record.count() > 0)
    {
        var edit = JSON.parse(this.record.get(0).get('data'));

        if (active)
        {
            this.processEdit(edit, this.record.get(0));
        }
        
        active = active || edit.id == lastEdit;
        this.record.get(0).delete();
    }
    
    this.allEdits = {};
    saveDocument();
    cleanupRevisions();
};

Session.prototype.replaceRefs = function(change)
{
    if (change.model != null)
    {
        var enc = mxCodecRegistry.getCodec(change.constructor);
        
        if (enc != null && enc.idrefs != null)
        {
            for (var i = 0; i < enc.idrefs.length; i++)
            {
                var current = change[enc.idrefs[i]];
                var update = change.model.getCell(this.codec.getId(current));
                
                if (update != current && update != null)
                {
                    change[enc.idrefs[i]] = update;
                }
            }
        }
    }
};

Session.prototype.processEdits = function(record, initial, fit)
{
    debug('entering processEdits', record.count() + ' total', this.localEdits.length +
          ' local', (record.count() - this.lastCount) + ' new');
    var t0 = new Date().getTime();
    
    if (this.lastCount < record.count())
    {
        this.lastCount = record.count();
        var seen = true;
        var q = [];
        
        for (var i = 0; i < record.count(); i++)
        {
            var rec = record.get(i);
            
            if (seen && this.allEdits[rec.getId()] == null)
            {
                seen = false;
            }
            
            if (!seen)
            {
                q.push({record: rec, edit: JSON.parse(rec.get('data'))});
            }
        }
        
        if (q.length > 0)
        {
            destroyNewDialog();
            var local = q.length == this.localEdits.length;
            
            // Checks if all queued entries are local and in order
            for (var i = 0; i < this.localEdits.length && local; i++)
            {
                local = local && q[i].edit.id == this.localEdits[i].id; 
            }

            if (local)
            {
                for (var i = 0; i < this.localEdits.length; i++)
                {
                    this.allEdits[q[i].record.getId()] = this.localEdits[i].edit; 
                }
                
                this.localEdits = [];
            }
            else
            {
                this.ignoreNotify = true;
                this.graph.container.style.visibility = 'hidden';
                var selection = this.graph.getSelectionCells();
                
                // Undo all local edits
                for (var i = this.localEdits.length - 1; i >= 0; i--)
                {
                    var edit = this.localEdits[i].edit;
                    var notify = edit.notify;
                    
                    // Override is needed for active handler state
                    edit.notify = function() {};
                    
                    if (edit.undone)
                    {
                        debug('redo local edit', i, this.localEdits[i].id);
                        edit.redo();
                    }
                    else
                    {
                        debug('undo local edit', i, this.localEdits[i].id);
                        edit.undo();
                    }
                    
                    edit.notify = notify;
                }
                
                // Undo edits that have been processed
                for (var i = q.length - 1; i >= 0; i--)
                {
                    var temp = this.allEdits[q[i].record.getId()];
                    
                    if (temp != null)
                    {
                        var notify = temp.notify;
                        temp.notify = function() {};
                        
                        if (temp.undone)
                        {
                            debug('redo stored edit', q[i].edit.id);
                            temp.redo();
                        }
                        else
                        {
                            debug('undo stored edit', q[i].edit.id);
                            temp.undo();
                        }
                        
                        temp.notify = notify;
                    }
                }
        
                // Process all edits
                debug('processing', q.length + ' edit(s)');
                var processedEdits = [];
                
                for (var i = 0; i < q.length; i++)
                {
                    processedEdits.push(this.processEdit(q[i].edit, q[i].record));
                }
                
                debug('updated model at ' + record.count() + ' edit(s) with ' + this.localEdits.length + ' pending');
                
                // Redo pending local edits
                for (var i = 0; i < this.localEdits.length; i++)
                {
                    var edit = this.localEdits[i].edit;
                    var notify = edit.notify;
                    edit.notify = function() {};
                    
                    for (var j = 0; j < edit.changes.length; j++)
                    {
                        this.replaceRefs(edit.changes[j]);
                    }
                    
                    if (edit.undone)
                    {
                        debug('redo pending local edit', i, this.localEdits[i].id);
                        edit.redo();
                    }
                    else
                    {
                        debug('undo pending local edit', i, this.localEdits[i].id);
                        edit.undo();
                    }
                    
                    edit.notify = notify;
                    processedEdits.push(edit);
                }
                
                // Selects first page
                if (initial && initialPageId != null)
                {
                    ui.selectPage(ui.getPageById(initialPageId), true);
                    initialPageId = null;
                }
                else if (initial && ui.pages != null && ui.currentPage != ui.pages[0])
                {
                    ui.selectPage(ui.pages[0], true);
                }
                else
                {
                    // Invalidates cell states
                    for (var i = 0; i < processedEdits.length; i++)
                    {
                        for (var j = 0; j < processedEdits[i].changes.length; j++)
                        {
                            graph.processChange(processedEdits[i].changes[j]);
                        }
                    }
    
                    // Updates text editor if cell changes during validation
                    var redraw = this.graph.cellRenderer.redraw;
                    
                    this.graph.cellRenderer.redraw = function(state)
                    {
                        if (state.view.graph.isEditing(state.cell))
                        {
                            state.view.graph.cellEditor.resize();
                            state.view.graph.scrollCellToVisible(state.cell);
                        }
                        
                        redraw.apply(this, arguments);
                    };
                    
                    // Revalidates diagram
                    graph.view.validate();
                    this.graph.cellRenderer.redraw = redraw;
    
                    // Restores selection
                    if (selection.length > 0)
                    {
                        var temp = [];
                        
                        for (var i = 0; i < selection.length; i++)
                        {
                            var newCell = this.model.getCell(selection[i].id);
                            
                            if (newCell != null)
                            {
                                temp.push(newCell);
                            }
                        }
        
                        this.graph.setSelectionCells(temp);
                    }
                    else
                    {
                        ui.updateActionStates();                    
                    }
    
                    ui.updateTabContainer();
                    graph.sizeDidChange();
                }
                
                updateActions();
                updateBorder();
    
                if (quip.apps.isAppFocused() && !fit)
                {
                    updateContainerSize();
                }
                else
                {
                    fitDiagram(true, true);
                }

                this.graph.container.style.visibility = '';
                this.ignoreNotify = false;
            }
        }
    }

    debug('leaving processEdits', (new Date().getTime() - t0) + 'ms');
};

Session.prototype.encodeChanges = function(changes, invert)
{
    var xml = [];
    var step = (invert) ? -1 : 1;
    var i0 = (invert) ? changes.length - 1 : 0;

    for (var i = i0; i >= 0 && i < changes.length; i += step)
    {   
        // Newlines must be kept, they will be converted to
        // &#xa; when the server sends data to the client
        if (changes[i].constructor != SelectPage)
        {
            var node = this.codec.encode(changes[i]);
            xml.push(mxUtils.getXml(node, this.linefeed));
        }
    }
    
    return xml.join('');
};

Session.prototype.processEdit = function(edit, record)
{
    var localEdit = null;
    
    // Finds local edit
    for (var i = 0; i < this.localEdits.length; i++)
    {
        if (this.localEdits[i].id == edit.id)
        {
            debug('remove pending edit', edit.id);
            localEdit = this.localEdits[i].edit;
            this.localEdits.splice(i, 1);
            
            break;
        }
    }
    
    if (localEdit == null)
    {
        localEdit = this.allEdits[record.getId()];
    }
    
    var undoableEdit = localEdit;
    
    if (undoableEdit == null)
    {
        var xml = (edit.data.charAt(0) == '<') ? edit.data : 
        	Graph.decompress(edit.data);
        undoableEdit = this.createUndoableEdit(this.decodeChanges(edit,
        	mxUtils.parseXml(xml).documentElement))
    }
    
    if (undoableEdit.changes.length > 0)
    {
        this.allEdits[record.getId()] = undoableEdit;
        var notify = undoableEdit.notify;
        undoableEdit.notify = function() {};

        for (var j = 0; j < undoableEdit.changes.length; j++)
        {
            this.replaceRefs(undoableEdit.changes[j]);
        }
        
        if (localEdit == undoableEdit)
        {
            if (undoableEdit.undone)
            {
                debug('redo edit', edit.id, undoableEdit);
                undoableEdit.redo();
            }
            else
            {
                debug('undo edit', edit.id, undoableEdit);
                undoableEdit.undo();
            }
        }
        else
        {
            debug('execute', edit, undoableEdit);
            
            // Fires change but no notify event
            undoableEdit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
                'edit', undoableEdit, 'changes', undoableEdit.changes));
        }
        
        undoableEdit.notify = notify;
    }
    
    return undoableEdit;
};

/**
 * Function: decodeChanges
 * 
 * Decodes and executes the changes represented by the children in the
 * given node. Returns an array that contains all changes.
 */
Session.prototype.decodeChanges = function(edit, node, exec)
{
    // Temporary codec
    var tempCodec = new mxCodec(node.ownerDocument);
    tempCodec.ui = ui;

    // Parses and executes the changes on the model
    var changes = [];
    node = node.firstChild;
    
    while (node != null)
    {
        var change = this.decodeChange(edit, node, tempCodec, exec);
        
        if (change != null)
        {
            changes.push(change);
        }
        
        node = node.nextSibling;
    }
    
    return changes;
};

/**
 * Function: decodeChange
 * 
 * Decodes, executes and returns the change object represented by the given
 * XML node.
 */
Session.prototype.decodeChange = function(edit, node, tempCodec, exec)
{
    exec = (exec != null) ? exec : true;
    var change = null;

    if (node.nodeType == mxConstants.NODETYPE_ELEMENT)
    {
        try
        {
    		var page = null;
    		
            if (node.nodeName == 'mxRootChange' || node.nodeName == 'ChangePage')
            {
                // Handles the special case were no ids should be
                // resolved in the existing model. This change will
                // replace all registered ids and cells from the
                // model and insert a new cell hierarchy instead.
                var tmp = new mxCodec(node.ownerDocument);
                tmp.ui = ui;
                change = tmp.decode(node);
                page = change.relatedPage;
            }

			// Special handling for pages
			if (change != null && node.nodeName == 'ChangePage' &&
				change.index == null && page != null &&
				ui.getPageById(page.getId()) != null)
			{
				// Finds page to be selected after removal
				var tmp = mxUtils.indexOf(ui.pages, page);

				if (tmp == ui.pages.length - 1)
				{
					tmp--;
				}
				else
				{
					tmp++;
				}

				change.page = ui.pages[tmp];
				change.previousPage = change.page;
				debug('page removed', ui.pages.length, tmp, page.getId());
			}
			else if (page == null)
			{
				page = ui.getPageById(edit.pageid);
			}

            if (page != null)
            {
                var model = this.model;
    
                if (page.model == null)
                {
                    page.model = new mxGraphModel();
                    page.model.prefix = guid() + '-';
                    
                    if (page.root == null && page.node != null)
                    {
                        ui.updatePageRoot(page);
                    }
                    
                    if (page.root != null)
                    {
                        page.model.setRoot(page.root);
                    }
                    else
                    {
                        page.root = page.model.root;
                    }
                }
                
                if (page != ui.currentPage)
                {
                    model = page.model;
                    debug('using page model', model);
                }
    
                // Cell changes resolve IDs in the current model
                if (change == null)
                {    
                    tempCodec.lookup = function(id)
                    {
                        return model.getCell(id);
                    };
                    
                    change = tempCodec.decode(node);
                }
                
				// Model is required for cell changes and page
				// is required for page changes and they are
				// ignored in the opposite type of change
				change.model = model;
				change.page = page;

                if (exec)
                {
                    change.execute();
                    
					// Marks cached XML as dirty
					page.needsUpdate = true;
            
                    // Workaround for references not being resolved if cells have
                    // been removed from the model prior to being referenced. This
                    // adds removed cells in the codec object lookup table.
                    if (change != null && node.nodeName == 'mxChildChange' &&
                        change.parent == null && change.child != null)
                    {
                        this.cellRemoved(change.child, tempCodec);
                    }
                }
            }
        }
        catch (e)
        {
            debug('ignored', node, change, e);
            change = null;
        }
    }
    
    return change;
};

/**
 * Function: cellRemoved
 * 
 * Adds removed cells to the codec object lookup for references to the removed
 * cells after this point in time.
 */
Session.prototype.cellRemoved = function(cell, codec)
{
    codec.putObject(cell.getId(), cell);
    var childCount = this.model.getChildCount(cell);
    
    for (var i = 0; i < childCount; i++)
    {
        this.cellRemoved(this.model.getChildAt(cell, i), codec);
    }
};

/**
 * Function: createUndoableEdit
 * 
 * Creates a new <mxUndoableEdit> that implements the notify function to fire a
 * <change> and <notify> event via the model.
 */
Session.prototype.createUndoableEdit = function(changes)
{
    var edit = new mxUndoableEdit(this.model, false);
    edit.changes = changes;
    
    edit.notify = function()
    {
        // LATER: Remove changes property (deprecated)
        edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
            'edit', edit, 'changes', edit.changes));
        edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
            'edit', edit, 'changes', edit.changes));
    };
    
    return edit;
};
