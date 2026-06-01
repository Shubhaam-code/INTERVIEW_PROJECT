import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAi } from "../services/openRouter.service.js"


export const analyzeResume = async (req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({message:"Resume Required"})
        }
        const filepath=req.file.path

        //file convert into binary data

        const fileBuffer =await fs.promises.readFile(filepath)

        //pdfjs-dist ye package yahi format use karta ha
        const uint8Array = new Uint8Array(fileBuffer)

        const loadingTask = pdfjsLib.getDocument({data:uint8Array})
        const pdf = await loadingTask.promise

        let resumeText = "";

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText
        .replace(/\s+/g, " ")
        .trim();

        const messages = [
            {
                role: "system",
                content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        const aiResponse = await askAi(messages)
        const parsed = JSON.parse(aiResponse)
        fs.unlinkSync(filepath)

        res.json({
            role:parsed.role,
            experience:parsed.experience,
            projects:parsed.projects,
            skills:parsed.skills,
            resumeText
        })
    } catch (error) {
        console.log(error)
        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({message:error.message})
    }
}