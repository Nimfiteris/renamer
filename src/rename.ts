import fs from 'fs'
// @ts-ignore
import PDFParser from "pdf2json";

fs.readdir("./content", (err, files) => {
	const amounts = {}
	return Promise.all(files.map((file) => {
		const fileName = `./content/${file}`
		return new Promise((y, n) => {
			
			const pdfParser = new PDFParser();
			pdfParser.on("pdfParser_dataError", (errData: any) => {
				console.error("Parser error", errData.parserError);
				n(new Error(errData))
			} );
			pdfParser.on("pdfParser_dataReady", ({ Transcoder, Meta, Pages }: any) => {
				const raw = Pages.reduce((acc: Array<any>, {Texts}) => {
					return acc.concat(Texts)
				}, []).map((t: any) => t.R);

				const data = raw.reduce((acc, t:any, idx: number) => {
					const [fontFaceId, fontSize, isBold, isItalic] = t[0].TS;
					if (fontSize > 16 && isBold && fontSize < 20) {
						acc.title.push(t[0])
					} else if (fontSize > 24 && idx > 30) {
						acc.id.push(t[0])
					}
					return acc;
				}, {
					title: [],
					id: [],
				});

				const title = data.title.map((text: any) => decodeURIComponent( text.T ).trim()).join(' ')
					.replace(/\//g, "-");

				const id = data.id.map((text: any) => decodeURIComponent( text.T ).trim()).join(' ')
					.replace(/\//g, "-");

				const result = `${id} ${title}`
				const dist = `./dist/${result}.pdf`;

				if (amounts[result]) {
					return n(new Error(`DUBLICATED VALUE ${result} from ${fileName} and ${amounts[result]}`))
				}

				amounts[result] = fileName
			
				fs.copyFile(fileName, dist, (err: any) => {
					if (err) {
						console.error(`ERROR COPYING ${fileName} to ${dist}`, err)
						return n(err);
					}
					console.log(`Copying ${fileName} to ${result} finished`)
					y(data)
				})
			
			});
	
			pdfParser.loadPDF(fileName);
		})
	}))
	.then((data) => {
		console.log("FINISHED: #", data.length)
		fs.writeFileSync("./output.json", JSON.stringify(data, undefined, "\t"));
	}).catch((error) => {
		fs.writeFileSync("./output.json", error.toString());
		console.log({error})
		console.error(error);
	});
})