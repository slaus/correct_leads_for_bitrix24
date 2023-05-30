const fs = require('fs');
const path = require('path');

const sourceDir = 'files';
const targetDir = 'ready';

// Создание папки targetDir, если она не существует
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
}

// Функция для рекурсивного удаления ключей и обновления значений
const deleteKeysAndValues = (obj, keys) => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deleteKeysAndValues(item, keys));
    }

    const result = {};
    Object.keys(obj).forEach(key => {
        if (!keys.includes(key)) {
            result[key] = deleteKeysAndValues(obj[key], keys);
        }
    });

    // Обновление значений ключей
    const keysToReplace = ['CHANGED_BY', 'CLOSED_BY', 'STATUS_CHANGED_BY'];
    keysToReplace.forEach(key => {
        if (result.hasOwnProperty(key)) {
            result[key] = '1';
        }
    });

    return result;
};

// Функция для обработки каждого файла
const processFile = (file) => {
    const filePath = path.join(sourceDir, file);

    // Чтение содержимого файла
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${file}: ${err}`);
            return;
        }

        try {
            // Разбор JSON данных
            const jsonData = JSON.parse(data);

            const keysToDelete = [
                'ACCOMPLICES',
                'AUDITORS',
                'CREATED_BY',
                'CREATED_BY_LAST_NAME',
                'CREATED_BY_NAME',
                'CREATED_BY_SECOND_NAME',
                'GUID',
                'RESPONSIBLE_LAST_NAME',
                'RESPONSIBLE_NAME',
                'RESPONSIBLE_SECOND_NAME',
                'time'
            ];

            // Удаление ключей и обновление значений
            const updatedData = deleteKeysAndValues(jsonData, keysToDelete);

            // Преобразование обновленных данных обратно в JSON
            const updatedDataString = JSON.stringify(updatedData, null, 2);

            // Путь для сохранения обновленного файла
            const targetFilePath = path.join(targetDir, file);

            // Запись обновленных данных в целевой файл
            fs.writeFile(targetFilePath, updatedDataString, 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing file ${file}: ${err}`);
                } else {
                    console.log(`File ${file} processed successfully.`);
                }
            });
        } catch (error) {
            console.error(`Error processing file ${file}: ${error}`);
        }
    });
};

// Получение списка файлов с расширением .txt из sourceDir
const files = fs.readdirSync(sourceDir).filter(file => path.extname(file) === '.txt');

// Обработка каждого файла
files.forEach(processFile);

// Вывод алерта после завершения обработки файлов
console.log('All files processed. Alert: File processing completed.');