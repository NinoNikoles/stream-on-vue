const multer = require('multer');
const fs = require('fs').promises;
const ffs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

async function generateStructure(folderPath) {
    try {
        const files = await fs.readdir(folderPath);

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

const checkFolderExists = async (folder) => {
    try {
        await fs.access(folder);
        return true;
    } catch (err) {
        return false;
    }
};

const createFolder = async (req, res) => {
    const { folder } = req.body.params;

    try {
        const folderExists = await checkFolderExists(folder);

        if (folderExists) {
            res.status(400).send('Folder already exists');
        } else {
            await fs.mkdir(folder, { recursive: true });
            res.send('Folder created successfully');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const renameFolder = async (req, res) => {
    const { oldName, newName } = req.body.params;

    try {
        await fs.rename(oldName, newName);
        res.send('Folder renamed successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const deleteFolder = async (req, res) => {
    const { folder } = req.body.params;

    try {
        rimraf.sync(folder);
        res.send('Folder deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting folder');
    }
};

const deleteFile = async (req, res) => {
    const { filePath } = req.body.params;

    try {
        rimraf.sync(filePath);
        res.send('File deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting file');
    }
};

const uploadVideo = async (req, res) => {
    const { folder } = req.query;
    const uploadDirectory = path.join(__dirname, `../${folder}`);

    // Funktion zum Umbenennen der Datei bei Konflikt
    const resolveFileNameConflict = (folder, fileName) => {
        let index = 1;
        let newFileName = fileName;
        const fileBase = path.parse(fileName).name;
        const fileExt = path.parse(fileName).ext;
    
        while (ffs.existsSync(path.join(folder, newFileName))) {
            newFileName = `${fileBase}_${index}${fileExt}`;
            index++;
        }
    
        return newFileName;
    };

    // Konfiguration für Multer (Dateiupload)
    const storage = multer.diskStorage({
        destination: function (_, file, cb) {
            cb(null, uploadDirectory);
        },
        filename: function (_, file, cb) {
            const resolvedFileName = resolveFileNameConflict(uploadDirectory, file.originalname);
            cb(null, resolvedFileName);
        },
    });

    const upload = multer({ storage: storage }).single('mp4File');

    // Dateiupload durchführen
    upload(req, res, function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.send('Datei erfolgreich hochgeladen.');
    });
};


module.exports = {
    getFolderStructure,
    createFolder,
    renameFolder,
    deleteFolder,
    deleteFile,
    uploadVideo
}