import { argv } from "node:process";

const opt = (name, def) => {
	const i = argv.indexOf(name);
	return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const source = opt("--source", "https://shevet-imahot.co.il").replace(/\/$/, "");
const target = opt("--target", "http://localhost:4321").replace(/\/$/, "");
const samples = [
	["article", "/pregnancy-blog/avira-neima/", "/articles/avira-neima/"],
	["article", "/pregnancy-blog/chooseadoula/", "/articles/chooseadoula/"],
	["article", "/pregnancy-blog/whatdoesadoulado/", "/articles/whatdoesadoulado/"],
	["article", "/pregnancy-blog/accompany/", "/articles/accompany/"],
	["doula", "/doulas-premium/irit-angel/", "/doulas/irit-angel/"],
	["doula", "/doulas-premium/keren-eitan/", "/doulas/keren-eitan/"],
	["doula", "/doulas-premium/osnat_b/", "/doulas/osnat_b/"],
	["doula", "/doulas-premium/adi-e/", "/doulas/adi-e/"],
	["professional", "/therapist-premium/emma-li/", "/professionals/emma-li/"],
	["professional", "/therapist-premium/sunnyki/", "/professionals/sunnyki/"],
	["professional", "/therapist-premium/shlomit_h_h/", "/professionals/shlomit_h_h/"],
	["professional", "/therapist-premium/daniel-s/", "/professionals/daniel-s/"],
	["benefit", "/benefits/head-to-toe/", "/benefits/head-to-toe/"],
	["benefit", "/benefits/deedoo/", "/benefits/deedoo/"],
	["benefit", "/benefits/stella/", "/benefits/stella/"],
	["benefit", "/benefits/urban-baby-wrap/", "/benefits/urban-baby-wrap/"],
	["community", "/community/26-1/", "/community/26-1/"],
	["community", "/community/digitalmarketing/", "/community/digitalmarketing/"],
	["community", "/community/march/", "/community/march/"],
	["community", "/community/july/", "/community/july/"],
	["course", "/courses/dao-shir-barash/", "/courses/dao-shir-barash/"],
	["course", "/courses/bio/", "/courses/bio/"],
	["course", "/courses/seminar/", "/courses/seminar/"],
	["course", "/courses/henigold/", "/courses/henigold/"],
];
const text = (html) =>
	html
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
const mainText = (html) => text(html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html);
let failed = 0;
for (const [type, oldPath, newPath] of samples) {
	const [oldRes, newRes] = await Promise.all([fetch(source + oldPath), fetch(target + newPath)]);
	const [oldHtml, newHtml] = await Promise.all([oldRes.text(), newRes.text()]);
	const oldLen = mainText(oldHtml).length;
	const newLen = mainText(newHtml).length;
	const ok =
		oldRes.status === 200 &&
		newRes.status === 200 &&
		(newLen >= 100 || newLen >= Math.min(250, Math.floor(oldLen * 0.7)));
	process.stdout.write(
		`${ok ? "PASS" : "FAIL"} ${type} ${oldPath} -> ${newPath} old=${oldRes.status}/${oldLen} new=${newRes.status}/${newLen}\n`,
	);
	if (!ok) failed += 1;
}
if (failed) throw new Error(`${failed} parity samples failed`);
