//const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

async function generateStructure(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        //var mainPath = parentPath + folderPath;
        const structure = {
            name: path.basename(folderPath),
            type: 'folder',
            path: folderPath.replace(/\\/g, '/'),
            children: [],
        };
    
        files.sort();
    
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const isDirectory = (await fs.stat(filePath)).isDirectory();

            if (isDirectory) {
                structure.children.push(await generateStructure(filePath));
            } else {
                structure.children.push({
                    name: file,
                    type: 'file',
                    path: filePath.replace(/\\/g, '/'),
                });
            }
        }
  
        structure.children.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'folder' ? -1 : 1;
        });
    
        return structure;
    } catch (err) {
        console.error(err);
        throw err; // Rethrow the error for the calling function to handle
    }
}
  
const getFolderStructure = async (req, res) => {
    const { folder } = req.query;
    const folderPath = path.join(folder);

    try {
        const structure = await generateStructure(folderPath);
        res.json(structure);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getFolderStructure
}