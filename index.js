const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
    try {
        // Informationen über das hochgeladene Objekt
        const bucket = event.Records[0].s3.bucket.name;
        const key = event.Records[0].s3.object.key;

        // Überprüfen, ob die Datei eine .txt-Datei ist
        if (key.toLowerCase().endsWith('.txt')) {
            // Download der Datei vom Quell-Bucket
            const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
            const content = data.Body.toString();

            // Zählen der Großbuchstaben in der Datei
            const uppercaseCount = (content.match(/[A-Z]/g) || []).length;

            // Transformation der Daten
            const transformedContent = content.toLowerCase();

            // Datei im Ziel-Bucket speichern
            const targetKey = `${key.split('.')[0]}_${uppercaseCount}.txt`;
            await s3.upload({ Bucket: 'dennis-ha-target', Key: targetKey, Body: transformedContent }).promise();

            // Konsolenlog für Erfolg
            console.log(`Datei "${key}" erfolgreich verarbeitet und in "dennis-ha-target" Bucket hochgeladen.`);
        } else {
            // Konsolenlog, wenn die Datei keine .txt-Datei ist
            console.log(`Die hochgeladene Datei "${key}" ist keine Textdatei. Die Funktion wird abgebrochen.`);
        }

        return {
            statusCode: 200,
            body: 'Success'
        };
    } catch (error) {
        console.error('Fehler:', error);
        return {
            statusCode: 500,
            body: 'Internal Server Error'
        };
    }
};
