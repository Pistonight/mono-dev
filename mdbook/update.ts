import { $ } from "bun";

const dir = import.meta.dirname;

await $`rm -rf ${dir}/template`;
await $`mdbook init --ignore none --force --theme ${dir}/template`;
// no change needed to some files
await $`rm -rf ${dir}/template/theme/css`;
await $`rm -rf ${dir}/template/theme/fonts`;
await $`rm ${dir}/template/theme/favicon.png`;
await $`rm ${dir}/template/theme/favicon.svg`;
await $`rm ${dir}/template/theme/highlight.css`;
await $`rm ${dir}/template/theme/highlight.js`;
await $`rm ${dir}/template/theme/book.js`;
// install additional CSS from admonish
await $`mdbook-admonish install ${dir}/template --css-dir ${dir}/template/theme`;

// download catppuccin
const catppuccinAdmonishCss = await fetch("https://github.com/catppuccin/mdBook/releases/download/v3.1.0/catppuccin-admonish.css")
await Bun.file(`${dir}/template/theme/catppuccin-admonish.css`)
.write(
    await catppuccinAdmonishCss.text()
)
// we vendor the main catppuccin theme so it doesn't change
// const catppuccinCss = await fetch("https://github.com/catppuccin/mdBook/releases/download/v3.1.0/catppuccin.css")
// await Bun.file(`${dir}/template/theme/catppuccin.css`)
// .write(
//     await catppuccinCss.text()
// )

// save book template
const bookFile = Bun.file(`${dir}/template/book.toml`);
const content = await bookFile.text();
let admonishPreprossor: string[] | undefined = undefined;

for (const line of content.split("\n")) {
    if (line.startsWith("[preprocessor.admonish]")) {
        admonishPreprossor = ["[preprocessor.admonish]"];
        continue;
    }
    if (!admonishPreprossor) {
        continue;
    }
    if (line.startsWith("[")) {
        break;
    }
    admonishPreprossor.push(line);
}

const book =`[book]
authors = ["CHANGE--ME"]
language = "en"
multilingual = false
src = "src"
title = "CHANGE--ME"

${(admonishPreprossor as string[]).join("\n")}
[output.html]
default-theme = "frappe"
preferred-dark-theme = "frappe"
smart-punctuation = true
git-repository-url = "CHANGE--ME"
additional-css = [
    "./theme/mdbook-admonish.css",
    "./theme/extra-css/catppuccin.css", 
    "./theme/catppuccin-admonish.css",
    "./theme/extra-css/patch.css", 
]`;

await bookFile.write(book);

// replace theme menu with catppuccin
const indexFile = Bun.file(`${dir}/template/theme/index.hbs`);
const indexLines = (await indexFile.text()).split("\n");
const lines = [];
let i = 0;
for (;i<indexLines.length; i++) {
    if (indexLines[i].trim().startsWith(`<ul id="theme-list"`)) {
        lines.push(indexLines[i]);
        i++;
        break;
    }
    lines.push(indexLines[i]);
}
const makeCatppuccinTag = (id: string, name: string) => {
    return `<li role="none"><button role="menuitem" class="theme" id="${id}">${name}</button></li> `
}
lines.push(...[
    makeCatppuccinTag("latte", "Latte"),
    makeCatppuccinTag("frappe", "Frappé"),
    makeCatppuccinTag("macchiato", "Macchiato"),
    makeCatppuccinTag("mocha", "Mocha"),
]);
for (;i<indexLines.length; i++) {
    if (!indexLines[i].trim().startsWith("</ul>")) {
        continue;
    }
    lines.push(indexLines[i]);
    i++;
    break;
}
for (;i<indexLines.length; i++) {
    lines.push(indexLines[i]);
}
await indexFile.write(lines.join("\n"));

// copy to output
await $`rm -rf ${dir}/theme`;
await $`rm -f ${dir}/book.toml`;
await $`cp -r ${dir}/template/theme ${dir}`;
await $`cp ${dir}/template/book.toml ${dir}`;
await $`rm -rf ${dir}/template`;
