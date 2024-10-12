export const css = `/*
*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

textarea {
  resize: vertical;
}

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

button,
[role="button"] {
  cursor: pointer;
}

:disabled {
  cursor: default;
}

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

img,
video {
  max-width: 100%;
  height: auto;
}


[hidden] {
  display: none;
}

*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

.\!container {
  width: 100% !important;
}

.container {
  width: 100%;
}

@media (min-width: 640px) {
  .\!container {
    max-width: 640px !important;
  }

  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .\!container {
    max-width: 768px !important;
  }

  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .\!container {
    max-width: 1024px !important;
  }

  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .\!container {
    max-width: 1280px !important;
  }

  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .\!container {
    max-width: 1536px !important;
  }

  .container {
    max-width: 1536px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.pointer-events-none {
  pointer-events: none;
}

.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.sticky {
  position: sticky;
}

.inset-0 {
  inset: 0px;
}

.inset-\[2px\] {
  inset: 2px;
}

.-top-16 {
  top: -4rem;
}

.bottom-0 {
  bottom: 0px;
}

.left-1\/2 {
  left: 50%;
}

.left-2 {
  left: 0.5rem;
}

.left-\[-9999px\] {
  left: -9999px;
}

.right-0 {
  right: 0px;
}

.right-2 {
  right: 0.5rem;
}

.top-1\/2 {
  top: 50%;
}

.top-2 {
  top: 0.5rem;
}

.top-\[-9999px\] {
  top: -9999px;
}

.isolate {
  isolation: isolate;
}

.z-0 {
  z-index: 0;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.z-30 {
  z-index: 30;
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

.z-\[1\] {
  z-index: 1;
}

.row-span-1 {
  grid-row: span 1 / span 1;
}

.row-span-2 {
  grid-row: span 2 / span 2;
}

.-mx-1 {
  margin-left: -0.25rem;
  margin-right: -0.25rem;
}

.mx-4 {
  margin-left: 1rem;
  margin-right: 1rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.my-1 {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.my-2 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-auto {
  margin-left: auto;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-10 {
  margin-top: 2.5rem;
}

.mt-12 {
  margin-top: 3rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-auto {
  margin-top: auto;
}

.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.table {
  display: table;
}

.grid {
  display: grid;
}

.hidden {
  display: none;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

.size-20 {
  width: 5rem;
  height: 5rem;
}

.size-28 {
  width: 7rem;
  height: 7rem;
}

.size-5 {
  width: 1.25rem;
  height: 1.25rem;
}

.size-8 {
  width: 2rem;
  height: 2rem;
}

.size-full {
  width: 100%;
  height: 100%;
}

.h-0\.5 {
  height: 0.125rem;
}

.h-10 {
  height: 2.5rem;
}

.h-11 {
  height: 2.75rem;
}

.h-12 {
  height: 3rem;
}

.h-16 {
  height: 4rem;
}

.h-2 {
  height: 0.5rem;
}

.h-2\.5 {
  height: 0.625rem;
}

.h-3\.5 {
  height: 0.875rem;
}

.h-32 {
  height: 8rem;
}

.h-4 {
  height: 1rem;
}

.h-40 {
  height: 10rem;
}

.h-64 {
  height: 16rem;
}

.h-8 {
  height: 2rem;
}

.h-9 {
  height: 2.25rem;
}

.h-\[1\.2rem\] {
  height: 1.2rem;
}

.h-\[100px\] {
  height: 100px;
}

.h-\[1px\] {
  height: 1px;
}

.h-\[var\(--radix-select-trigger-height\)\] {
  height: var(--radix-select-trigger-height);
}

.h-auto {
  height: auto;
}

.h-full {
  height: 100%;
}

.h-min {
  height: -moz-min-content;
  height: min-content;
}

.h-px {
  height: 1px;
}

.h-svh {
  height: 100svh;
}

.max-h-96 {
  max-height: 24rem;
}

.max-h-screen {
  max-height: 100vh;
}

.min-h-96 {
  min-height: 24rem;
}

.min-h-\[150px\] {
  min-height: 150px;
}

.min-h-\[200px\] {
  min-height: 200px;
}

.min-h-\[80px\] {
  min-height: 80px;
}

.min-h-screen {
  min-height: 100vh;
}

.w-0\.5 {
  width: 0.125rem;
}

.w-1\/2 {
  width: 50%;
}

.w-10 {
  width: 2.5rem;
}

.w-16 {
  width: 4rem;
}

.w-2 {
  width: 0.5rem;
}

.w-2\.5 {
  width: 0.625rem;
}

.w-3 {
  width: 0.75rem;
}

.w-3\.5 {
  width: 0.875rem;
}

.w-4 {
  width: 1rem;
}

.w-40 {
  width: 10rem;
}

.w-64 {
  width: 16rem;
}

.w-\[1\.2rem\] {
  width: 1.2rem;
}

.w-\[120px\] {
  width: 120px;
}

.w-\[140px\] {
  width: 140px;
}

.w-\[1px\] {
  width: 1px;
}

.w-auto {
  width: auto;
}

.w-fit {
  width: -moz-fit-content;
  width: fit-content;
}

.w-full {
  width: 100%;
}

.w-px {
  width: 1px;
}

.w-screen {
  width: 100vw;
}

.min-w-\[8rem\] {
  min-width: 8rem;
}

.min-w-\[var\(--radix-select-trigger-width\)\] {
  min-width: var(--radix-select-trigger-width);
}

.max-w-2xl {
  max-width: 42rem;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-7xl {
  max-width: 80rem;
}

.max-w-\[8rem\] {
  max-width: 8rem;
}

.max-w-full {
  max-width: 100%;
}

.max-w-xl {
  max-width: 36rem;
}

.max-w-xs {
  max-width: 20rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-none {
  flex: none;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.caption-bottom {
  caption-side: bottom;
}

.rotate-0 {
  --tw-rotate: 0deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.rotate-90 {
  --tw-rotate: 90deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.rotate-\[215deg\] {
  --tw-rotate: 215deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-100 {
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-\[0\.9\] {
  --tw-scale-x: 0.9;
  --tw-scale-y: 0.9;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes buttonheartbeat {
  0% {
    box-shadow: 0 0 0 0 hsl(var(--primary));
    transform: scale(1);
  }

  50% {
    box-shadow: 0 0 0 7px hsl(var(--primary) / 0);
    transform: scale(1.05);
  }

  100% {
    box-shadow: 0 0 0 0 hsl(var(--primary) / 0);
    transform: scale(1);
  }
}

.animate-buttonheartbeat {
  animation: buttonheartbeat 2s infinite ease-in-out;
}

@keyframes meteor {
  0% {
    transform: rotate(215deg) translateX(0);
    opacity: 1;
  }

  70% {
    opacity: 1;
  }

  100% {
    transform: rotate(215deg) translateX(-500px);
    opacity: 0;
  }
}

.animate-meteor-effect {
  animation: meteor 5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.cursor-default {
  cursor: default;
}

.cursor-pointer {
  cursor: pointer;
}

.touch-none {
  touch-action: none;
}

.select-none {
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
}

.resize {
  resize: both;
}

.list-inside {
  list-style-position: inside;
}

.list-decimal {
  list-style-type: decimal;
}

.list-disc {
  list-style-type: disc;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-rows-\[1fr_auto\] {
  grid-template-rows: 1fr auto;
}

.grid-rows-\[auto_1fr\] {
  grid-template-rows: auto 1fr;
}

.grid-rows-\[auto_1fr_auto\] {
  grid-template-rows: auto 1fr auto;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-nowrap {
  flex-wrap: nowrap;
}

.place-items-center {
  place-items: center;
}

.content-center {
  align-content: center;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-10 {
  gap: 2.5rem;
}

.gap-12 {
  gap: 3rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-8 {
  gap: 2rem;
}

.gap-x-px {
  -moz-column-gap: 1px;
       column-gap: 1px;
}

.gap-y-px {
  row-gap: 1px;
}

.space-x-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(0.5rem * var(--tw-space-x-reverse));
  margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
}

.space-x-4 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-right: calc(1rem * var(--tw-space-x-reverse));
  margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));
}

.space-y-1\.5 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.375rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.375rem * var(--tw-space-y-reverse));
}

.space-y-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
}

.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
}

.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1rem * var(--tw-space-y-reverse));
}

.space-y-6 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));
}

.space-y-8 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(2rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(2rem * var(--tw-space-y-reverse));
}

.overflow-auto {
  overflow: auto;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-visible {
  overflow: visible;
}

.overflow-y-auto {
  overflow-y: auto;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.rounded-2xl {
  border-radius: 1rem;
}

.rounded-3xl {
  border-radius: 1.5rem;
}

.rounded-\[100px\] {
  border-radius: 100px;
}

.rounded-\[22px\] {
  border-radius: 22px;
}

.rounded-\[2px\] {
  border-radius: 2px;
}

.rounded-\[9999px\] {
  border-radius: 9999px;
}

.rounded-\[inherit\] {
  border-radius: inherit;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: var(--radius);
}

.rounded-md {
  border-radius: calc(var(--radius) - 2px);
}

.rounded-sm {
  border-radius: calc(var(--radius) - 4px);
}

.border {
  border-width: 1px;
}

.border-2 {
  border-width: 2px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-l {
  border-left-width: 1px;
}

.border-t {
  border-top-width: 1px;
}

.border-dashed {
  border-style: dashed;
}

.border-blue-200 {
  --tw-border-opacity: 1;
  border-color: rgb(191 219 254 / var(--tw-border-opacity));
}

.border-gray-200 {
  --tw-border-opacity: 1;
  border-color: rgb(229 231 235 / var(--tw-border-opacity));
}

.border-gray-300 {
  --tw-border-opacity: 1;
  border-color: rgb(209 213 219 / var(--tw-border-opacity));
}

.border-green-200 {
  --tw-border-opacity: 1;
  border-color: rgb(187 247 208 / var(--tw-border-opacity));
}

.border-input {
  border-color: hsl(var(--input));
}

.border-neutral-200 {
  --tw-border-opacity: 1;
  border-color: rgb(229 229 229 / var(--tw-border-opacity));
}

.border-primary {
  border-color: hsl(var(--primary));
}

.border-red-200 {
  --tw-border-opacity: 1;
  border-color: rgb(254 202 202 / var(--tw-border-opacity));
}

.border-sky-400 {
  --tw-border-opacity: 1;
  border-color: rgb(56 189 248 / var(--tw-border-opacity));
}

.border-transparent {
  border-color: transparent;
}

.border-white {
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / var(--tw-border-opacity));
}

.border-l-transparent {
  border-left-color: transparent;
}

.border-t-transparent {
  border-top-color: transparent;
}

.bg-\[\#f7f7f7\] {
  --tw-bg-opacity: 1;
  background-color: rgb(247 247 247 / var(--tw-bg-opacity));
}

.bg-background {
  background-color: hsl(var(--background));
}

.bg-background\/95 {
  background-color: hsl(var(--background) / 0.95);
}

.bg-black {
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity));
}

.bg-black\/20 {
  background-color: rgb(0 0 0 / 0.2);
}

.bg-black\/50 {
  background-color: rgb(0 0 0 / 0.5);
}

.bg-blue-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(239 246 255 / var(--tw-bg-opacity));
}

.bg-border {
  background-color: hsl(var(--border));
}

.bg-card {
  background-color: hsl(var(--card));
}

.bg-destructive {
  background-color: hsl(var(--destructive));
}

.bg-gray-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}

.bg-gray-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--tw-bg-opacity));
}

.bg-green-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(240 253 244 / var(--tw-bg-opacity));
}

.bg-muted {
  background-color: hsl(var(--muted));
}

.bg-muted\/50 {
  background-color: hsl(var(--muted) / 0.5);
}

.bg-neutral-900\/50 {
  background-color: rgb(23 23 23 / 0.5);
}

.bg-popover {
  background-color: hsl(var(--popover));
}

.bg-primary {
  background-color: hsl(var(--primary));
}

.bg-primary\/10 {
  background-color: hsl(var(--primary) / 0.1);
}

.bg-red-100 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 226 226 / var(--tw-bg-opacity));
}

.bg-red-50 {
  --tw-bg-opacity: 1;
  background-color: rgb(254 242 242 / var(--tw-bg-opacity));
}

.bg-secondary {
  background-color: hsl(var(--secondary));
}

.bg-slate-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(100 116 139 / var(--tw-bg-opacity));
}

.bg-transparent {
  background-color: transparent;
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.from-primary\/30 {
  --tw-gradient-from: hsl(var(--primary) / 0.3) var(--tw-gradient-from-position);
  --tw-gradient-to: hsl(var(--primary) / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-primary {
  --tw-gradient-to: hsl(var(--primary)) var(--tw-gradient-to-position);
}

.decoration-clone {
  -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
}

.fill-current {
  fill: currentColor;
}

.fill-white {
  fill: #fff;
}

.p-1 {
  padding: 0.25rem;
}

.p-10 {
  padding: 2.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.p-8 {
  padding: 2rem;
}

.p-\[1px\] {
  padding: 1px;
}

.p-\[4px\] {
  padding: 4px;
}

.p-px {
  padding: 1px;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-2\.5 {
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-5 {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}

.py-0\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-1\.5 {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}

.py-16 {
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-10 {
  padding-bottom: 2.5rem;
}

.pb-2 {
  padding-bottom: 0.5rem;
}

.pl-8 {
  padding-left: 2rem;
}

.pr-2 {
  padding-right: 0.5rem;
}

.pt-0 {
  padding-top: 0px;
}

.pt-12 {
  padding-top: 3rem;
}

.pt-4 {
  padding-top: 1rem;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.align-middle {
  vertical-align: middle;
}

.font-firaCode {
  font-family: var(--font-fira-code), monospace;
}

.font-jetbrainsMono {
  font-family: var(--font-jetbrains-mono), monospace;
}

.font-lato {
  font-family: var(--font-lato), sans-serif;
}

.font-merriweather {
  font-family: var(--font-merriweather), serif;
}

.font-montserrat {
  font-family: var(--font-montserrat), sans-serif;
}

.font-openSans {
  font-family: var(--font-open-sans), sans-serif;
}

.font-oswald {
  font-family: var(--font-oswald), sans-serif;
}

.font-playfairDisplay {
  font-family: var(--font-playfair-display), serif;
}

.font-roboto {
  font-family: var(--font-roboto), sans-serif;
}

.font-sans {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.font-sourceSerif {
  font-family: var(--font-source-serif), serif;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.font-normal {
  font-weight: 400;
}

.font-semibold {
  font-weight: 600;
}

.italic {
  font-style: italic;
}

.leading-none {
  line-height: 1;
}

.leading-tight {
  line-height: 1.25;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-\[\#333\] {
  --tw-text-opacity: 1;
  color: rgb(51 51 51 / var(--tw-text-opacity));
}

.text-black {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity));
}

.text-blue-600 {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}

.text-blue-700 {
  --tw-text-opacity: 1;
  color: rgb(29 78 216 / var(--tw-text-opacity));
}

.text-card-foreground {
  color: hsl(var(--card-foreground));
}

.text-current {
  color: currentColor;
}

.text-destructive-foreground {
  color: hsl(var(--destructive-foreground));
}

.text-foreground {
  color: hsl(var(--foreground));
}

.text-gray-500 {
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity));
}

.text-gray-600 {
  --tw-text-opacity: 1;
  color: rgb(75 85 99 / var(--tw-text-opacity));
}

.text-gray-700 {
  --tw-text-opacity: 1;
  color: rgb(55 65 81 / var(--tw-text-opacity));
}

.text-gray-900 {
  --tw-text-opacity: 1;
  color: rgb(17 24 39 / var(--tw-text-opacity));
}

.text-green-700 {
  --tw-text-opacity: 1;
  color: rgb(21 128 61 / var(--tw-text-opacity));
}

.text-muted-foreground {
  color: hsl(var(--muted-foreground));
}

.text-neutral-400 {
  --tw-text-opacity: 1;
  color: rgb(163 163 163 / var(--tw-text-opacity));
}

.text-neutral-600 {
  --tw-text-opacity: 1;
  color: rgb(82 82 82 / var(--tw-text-opacity));
}

.text-neutral-700 {
  --tw-text-opacity: 1;
  color: rgb(64 64 64 / var(--tw-text-opacity));
}

.text-neutral-900 {
  --tw-text-opacity: 1;
  color: rgb(23 23 23 / var(--tw-text-opacity));
}

.text-popover-foreground {
  color: hsl(var(--popover-foreground));
}

.text-primary {
  color: hsl(var(--primary));
}

.text-primary-foreground {
  color: hsl(var(--primary-foreground));
}

.text-red-500 {
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity));
}

.text-red-700 {
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity));
}

.text-secondary-foreground {
  color: hsl(var(--secondary-foreground));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

.line-through {
  text-decoration-line: line-through;
}

.underline-offset-4 {
  text-underline-offset: 4px;
}

.antialiased {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.opacity-0 {
  opacity: 0;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-60 {
  opacity: 0.6;
}

.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\[0_0_0_1px_\#ffffff10\] {
  --tw-shadow: 0 0 0 1px #ffffff10;
  --tw-shadow-colored: 0 0 0 1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-md {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-input {
  --tw-shadow-color: hsl(var(--input));
  --tw-shadow: var(--tw-shadow-colored);
}

.outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.outline {
  outline-style: solid;
}

.ring-1 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.ring-offset-background {
  --tw-ring-offset-color: hsl(var(--background));
}

.blur {
  --tw-blur: blur(8px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.blur-xl {
  --tw-blur: blur(24px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow {
  --tw-drop-shadow: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.duration-500 {
  transition-duration: 500ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.will-change-transform {
  will-change: transform;
}

@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0));
  }
}

.duration-200 {
  animation-duration: 200ms;
}

.duration-300 {
  animation-duration: 300ms;
}

.duration-500 {
  animation-duration: 500ms;
}

.ease-out {
  animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.\[border\:calc\(var\(--border-width\)\*1px\)_solid_transparent\] {
  border: calc(var(--border-width) * 1px) solid transparent;
}

.\!\[mask-composite\:intersect\] {
  -webkit-mask-composite: source-in, xor !important;
          mask-composite: intersect !important;
}

.dark\:prose-invert:is(.dark *) {
  --tw-prose-body: var(--tw-prose-invert-body);
  --tw-prose-headings: var(--tw-prose-invert-headings);
  --tw-prose-lead: var(--tw-prose-invert-lead);
  --tw-prose-links: var(--tw-prose-invert-links);
  --tw-prose-bold: var(--tw-prose-invert-bold);
  --tw-prose-counters: var(--tw-prose-invert-counters);
  --tw-prose-bullets: var(--tw-prose-invert-bullets);
  --tw-prose-hr: var(--tw-prose-invert-hr);
  --tw-prose-quotes: var(--tw-prose-invert-quotes);
  --tw-prose-quote-borders: var(--tw-prose-invert-quote-borders);
  --tw-prose-captions: var(--tw-prose-invert-captions);
  --tw-prose-kbd: var(--tw-prose-invert-kbd);
  --tw-prose-kbd-shadows: var(--tw-prose-invert-kbd-shadows);
  --tw-prose-code: var(--tw-prose-invert-code);
  --tw-prose-pre-code: var(--tw-prose-invert-pre-code);
  --tw-prose-pre-bg: var(--tw-prose-invert-pre-bg);
  --tw-prose-th-borders: var(--tw-prose-invert-th-borders);
  --tw-prose-td-borders: var(--tw-prose-invert-td-borders);
}

.file\:border-0::file-selector-button {
  border-width: 0px;
}

.file\:bg-transparent::file-selector-button {
  background-color: transparent;
}

.file\:text-sm::file-selector-button {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.file\:font-medium::file-selector-button {
  font-weight: 500;
}

.placeholder\:text-muted-foreground::-moz-placeholder {
  color: hsl(var(--muted-foreground));
}

.placeholder\:text-muted-foreground::placeholder {
  color: hsl(var(--muted-foreground));
}

.before\:absolute::before {
  content: var(--tw-content);
  position: absolute;
}

.before\:top-1\/2::before {
  content: var(--tw-content);
  top: 50%;
}

.before\:h-\[1px\]::before {
  content: var(--tw-content);
  height: 1px;
}

.before\:w-\[50px\]::before {
  content: var(--tw-content);
  width: 50px;
}

.before\:-translate-y-\[50\%\]::before {
  content: var(--tw-content);
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.before\:transform::before {
  content: var(--tw-content);
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.before\:bg-gradient-to-r::before {
  content: var(--tw-content);
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.before\:from-\[\#64748b\]::before {
  content: var(--tw-content);
  --tw-gradient-from: #64748b var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(100 116 139 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.before\:to-transparent::before {
  content: var(--tw-content);
  --tw-gradient-to: transparent var(--tw-gradient-to-position);
}

.before\:content-\[\'\'\]::before {
  --tw-content: '';
  content: var(--tw-content);
}

.after\:absolute::after {
  content: var(--tw-content);
  position: absolute;
}

.after\:inset-y-0::after {
  content: var(--tw-content);
  top: 0px;
  bottom: 0px;
}

.after\:left-1\/2::after {
  content: var(--tw-content);
  left: 50%;
}

.after\:aspect-square::after {
  content: var(--tw-content);
  aspect-ratio: 1 / 1;
}

.after\:w-1::after {
  content: var(--tw-content);
  width: 0.25rem;
}

.after\:w-\[calc\(var\(--size\)\*1px\)\]::after {
  content: var(--tw-content);
  width: calc(var(--size) * 1px);
}

.after\:-translate-x-1\/2::after {
  content: var(--tw-content);
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes border-beam {
  100% {
    content: var(--tw-content);
    offset-distance: 100%;
  }
}

.after\:animate-border-beam::after {
  content: var(--tw-content);
  animation: border-beam calc(var(--duration)*1s) infinite linear;
}

.after\:\[animation-delay\:var\(--delay\)\]::after {
  content: var(--tw-content);
  animation-delay: var(--delay);
}

.after\:\[offset-anchor\:calc\(var\(--anchor\)\*1\%\)_50\%\]::after {
  content: var(--tw-content);
  offset-anchor: calc(var(--anchor) * 1%) 50%;
}

.after\:\[offset-path\:rect\(0_auto_auto_0_round_calc\(var\(--size\)\*1px\)\)\]::after {
  content: var(--tw-content);
  offset-path: rect(0 auto auto 0 round calc(var(--size) * 1px));
}

.hover\:bg-accent:hover {
  background-color: hsl(var(--accent));
}

.hover\:bg-black\/10:hover {
  background-color: rgb(0 0 0 / 0.1);
}

.hover\:bg-destructive\/80:hover {
  background-color: hsl(var(--destructive) / 0.8);
}

.hover\:bg-destructive\/90:hover {
  background-color: hsl(var(--destructive) / 0.9);
}

.hover\:bg-muted:hover {
  background-color: hsl(var(--muted));
}

.hover\:bg-muted\/50:hover {
  background-color: hsl(var(--muted) / 0.5);
}

.hover\:bg-primary\/80:hover {
  background-color: hsl(var(--primary) / 0.8);
}

.hover\:bg-primary\/90:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.hover\:bg-secondary\/80:hover {
  background-color: hsl(var(--secondary) / 0.8);
}

.hover\:text-accent-foreground:hover {
  color: hsl(var(--accent-foreground));
}

.hover\:text-muted-foreground:hover {
  color: hsl(var(--muted-foreground));
}

.hover\:underline:hover {
  text-decoration-line: underline;
}

.focus\:bg-accent:focus {
  background-color: hsl(var(--accent));
}

.focus\:text-accent-foreground:focus {
  color: hsl(var(--accent-foreground));
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus\:ring-blue-500:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));
}

.focus\:ring-ring:focus {
  --tw-ring-color: hsl(var(--ring));
}

.focus\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}

.focus-visible\:outline-none:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-visible\:ring-1:focus-visible {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus-visible\:ring-2:focus-visible {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus-visible\:ring-ring:focus-visible {
  --tw-ring-color: hsl(var(--ring));
}

.focus-visible\:ring-offset-1:focus-visible {
  --tw-ring-offset-width: 1px;
}

.focus-visible\:ring-offset-2:focus-visible {
  --tw-ring-offset-width: 2px;
}

.disabled\:pointer-events-none:disabled {
  pointer-events: none;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.group:hover .group-hover\:scale-100 {
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.group:hover .group-hover\:scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.group:hover .group-hover\:scale-\[1\.2\] {
  --tw-scale-x: 1.2;
  --tw-scale-y: 1.2;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.group\/file:hover .group-hover\/file\:shadow-2xl {
  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.group:hover .group-hover\:brightness-\[0\.8\] {
  --tw-brightness: brightness(0.8);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.peer:disabled ~ .peer-disabled\:cursor-not-allowed {
  cursor: not-allowed;
}

.peer:disabled ~ .peer-disabled\:opacity-70 {
  opacity: 0.7;
}

.data-\[disabled\]\:pointer-events-none[data-disabled] {
  pointer-events: none;
}

.data-\[panel-group-direction\=vertical\]\:h-px[data-panel-group-direction="vertical"] {
  height: 1px;
}

.data-\[panel-group-direction\=vertical\]\:w-full[data-panel-group-direction="vertical"] {
  width: 100%;
}

.data-\[side\=bottom\]\:translate-y-1[data-side="bottom"] {
  --tw-translate-y: 0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.data-\[side\=left\]\:-translate-x-1[data-side="left"] {
  --tw-translate-x: -0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.data-\[side\=right\]\:translate-x-1[data-side="right"] {
  --tw-translate-x: 0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.data-\[side\=top\]\:-translate-y-1[data-side="top"] {
  --tw-translate-y: -0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.data-\[panel-group-direction\=vertical\]\:flex-col[data-panel-group-direction="vertical"] {
  flex-direction: column;
}

.data-\[state\=checked\]\:bg-primary[data-state="checked"] {
  background-color: hsl(var(--primary));
}

.data-\[state\=on\]\:bg-accent[data-state="on"] {
  background-color: hsl(var(--accent));
}

.data-\[state\=open\]\:bg-accent[data-state="open"] {
  background-color: hsl(var(--accent));
}

.data-\[state\=selected\]\:bg-muted[data-state="selected"] {
  background-color: hsl(var(--muted));
}

.data-\[state\=checked\]\:text-primary-foreground[data-state="checked"] {
  color: hsl(var(--primary-foreground));
}

.data-\[state\=on\]\:text-accent-foreground[data-state="on"] {
  color: hsl(var(--accent-foreground));
}

.data-\[disabled\]\:opacity-50[data-disabled] {
  opacity: 0.5;
}

.data-\[state\=open\]\:animate-in[data-state="open"] {
  animation-name: enter;
  animation-duration: 150ms;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}

.data-\[state\=closed\]\:animate-out[data-state="closed"] {
  animation-name: exit;
  animation-duration: 150ms;
  --tw-exit-opacity: initial;
  --tw-exit-scale: initial;
  --tw-exit-rotate: initial;
  --tw-exit-translate-x: initial;
  --tw-exit-translate-y: initial;
}

.data-\[state\=closed\]\:fade-out-0[data-state="closed"] {
  --tw-exit-opacity: 0;
}

.data-\[state\=open\]\:fade-in-0[data-state="open"] {
  --tw-enter-opacity: 0;
}

.data-\[state\=closed\]\:zoom-out-95[data-state="closed"] {
  --tw-exit-scale: .95;
}

.data-\[state\=open\]\:zoom-in-95[data-state="open"] {
  --tw-enter-scale: .95;
}

.data-\[side\=bottom\]\:slide-in-from-top-2[data-side="bottom"] {
  --tw-enter-translate-y: -0.5rem;
}

.data-\[side\=left\]\:slide-in-from-right-2[data-side="left"] {
  --tw-enter-translate-x: 0.5rem;
}

.data-\[side\=right\]\:slide-in-from-left-2[data-side="right"] {
  --tw-enter-translate-x: -0.5rem;
}

.data-\[side\=top\]\:slide-in-from-bottom-2[data-side="top"] {
  --tw-enter-translate-y: 0.5rem;
}

.data-\[panel-group-direction\=vertical\]\:after\:left-0[data-panel-group-direction="vertical"]::after {
  content: var(--tw-content);
  left: 0px;
}

.data-\[panel-group-direction\=vertical\]\:after\:h-1[data-panel-group-direction="vertical"]::after {
  content: var(--tw-content);
  height: 0.25rem;
}

.data-\[panel-group-direction\=vertical\]\:after\:w-full[data-panel-group-direction="vertical"]::after {
  content: var(--tw-content);
  width: 100%;
}

.data-\[panel-group-direction\=vertical\]\:after\:-translate-y-1\/2[data-panel-group-direction="vertical"]::after {
  content: var(--tw-content);
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.data-\[panel-group-direction\=vertical\]\:after\:translate-x-0[data-panel-group-direction="vertical"]::after {
  content: var(--tw-content);
  --tw-translate-x: 0px;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.dark\:block:is(.dark *) {
  display: block;
}

.dark\:hidden:is(.dark *) {
  display: none;
}

.dark\:-rotate-90:is(.dark *) {
  --tw-rotate: -90deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.dark\:rotate-0:is(.dark *) {
  --tw-rotate: 0deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.dark\:border-blue-800:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(30 64 175 / var(--tw-border-opacity));
}

.dark\:border-gray-400:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(156 163 175 / var(--tw-border-opacity));
}

.dark\:border-gray-600:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(75 85 99 / var(--tw-border-opacity));
}

.dark\:border-gray-700:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(55 65 81 / var(--tw-border-opacity));
}

.dark\:border-green-800:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(22 101 52 / var(--tw-border-opacity));
}

.dark\:border-neutral-800:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(38 38 38 / var(--tw-border-opacity));
}

.dark\:border-red-800:is(.dark *) {
  --tw-border-opacity: 1;
  border-color: rgb(153 27 27 / var(--tw-border-opacity));
}

.dark\:bg-\[\#2d2d2d\]:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(45 45 45 / var(--tw-bg-opacity));
}

.dark\:bg-black:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity));
}

.dark\:bg-blue-950:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(23 37 84 / var(--tw-bg-opacity));
}

.dark\:bg-gray-700:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(55 65 81 / var(--tw-bg-opacity));
}

.dark\:bg-gray-800:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(31 41 55 / var(--tw-bg-opacity));
}

.dark\:bg-gray-900:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(17 24 39 / var(--tw-bg-opacity));
}

.dark\:bg-green-950:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(5 46 22 / var(--tw-bg-opacity));
}

.dark\:bg-neutral-100\/50:is(.dark *) {
  background-color: rgb(245 245 245 / 0.5);
}

.dark\:bg-neutral-800:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(38 38 38 / var(--tw-bg-opacity));
}

.dark\:bg-neutral-900:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(23 23 23 / var(--tw-bg-opacity));
}

.dark\:bg-neutral-950:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(10 10 10 / var(--tw-bg-opacity));
}

.dark\:bg-red-900:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(127 29 29 / var(--tw-bg-opacity));
}

.dark\:bg-red-950:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(69 10 10 / var(--tw-bg-opacity));
}

.dark\:bg-white\/20:is(.dark *) {
  background-color: rgb(255 255 255 / 0.2);
}

.dark\:bg-zinc-900:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(24 24 27 / var(--tw-bg-opacity));
}

.dark\:text-\[\#d4d4d4\]:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(212 212 212 / var(--tw-text-opacity));
}

.dark\:text-black:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity));
}

.dark\:text-blue-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(147 197 253 / var(--tw-text-opacity));
}

.dark\:text-gray-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(209 213 219 / var(--tw-text-opacity));
}

.dark\:text-green-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(134 239 172 / var(--tw-text-opacity));
}

.dark\:text-neutral-100:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(245 245 245 / var(--tw-text-opacity));
}

.dark\:text-neutral-200:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(229 229 229 / var(--tw-text-opacity));
}

.dark\:text-neutral-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(212 212 212 / var(--tw-text-opacity));
}

.dark\:text-neutral-400:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(163 163 163 / var(--tw-text-opacity));
}

.dark\:text-red-300:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(252 165 165 / var(--tw-text-opacity));
}

.dark\:text-white:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

.dark\:ring-offset-gray-800:is(.dark *) {
  --tw-ring-offset-color: #1f2937;
}

.dark\:focus\:ring-blue-600:focus:is(.dark *) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(37 99 235 / var(--tw-ring-opacity));
}

.dark\:data-\[state\=checked\]\:bg-gray-200[data-state="checked"]:is(.dark *) {
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
}

.dark\:data-\[state\=checked\]\:text-gray-900[data-state="checked"]:is(.dark *) {
  --tw-text-opacity: 1;
  color: rgb(17 24 39 / var(--tw-text-opacity));
}

@media (min-width: 640px) {
  .sm\:p-10 {
    padding: 2.5rem;
  }

  .sm\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .sm\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}

@media (min-width: 768px) {
  .md\:mx-0 {
    margin-left: 0px;
    margin-right: 0px;
  }

  .md\:block {
    display: block;
  }

  .md\:flex {
    display: flex;
  }

  .md\:h-24 {
    height: 6rem;
  }

  .md\:h-96 {
    height: 24rem;
  }

  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .md\:flex-row {
    flex-direction: row;
  }

  .md\:items-center {
    align-items: center;
  }

  .md\:space-y-0 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(0px * var(--tw-space-y-reverse));
  }

  .md\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .md\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .lg\:px-20 {
    padding-left: 5rem;
    padding-right: 5rem;
  }

  .lg\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.\[\&\:has\(\[role\=checkbox\]\)\]\:pr-0:has([role=checkbox]) {
  padding-right: 0px;
}

.\[\&\>span\]\:line-clamp-1>span {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.\[\&\>tr\]\:last\:border-b-0:last-child>tr {
  border-bottom-width: 0px;
}

.\[\&\[data-panel-group-direction\=vertical\]\>div\]\:rotate-90[data-panel-group-direction=vertical]>div {
  --tw-rotate: 90deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.\[\&_tr\:last-child\]\:border-0 tr:last-child {
  border-width: 0px;
}

.\[\&_tr\]\:border-b tr {
  border-bottom-width: 1px;
}
`;
