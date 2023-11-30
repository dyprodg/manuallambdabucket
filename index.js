const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
    try {
        const bucket = event.Records[0].s3.bucket.name;
        const key = event.Records[0].s3.object.key;

        if (event.Records[0].eventName.startsWith('ObjectCreated')) {
            // Datei wurde im Quell-Bucket erstellt

            if (key.toLowerCase().endsWith('.txt')) {
                const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
                const content = data.Body.toString();

                const uppercaseCount = (content.match(/[A-Z]/g) || []).length;
                const transformedContent = content.toLowerCase();

                const targetKey = `${key.split('.')[0]}_${uppercaseCount}.txt`;
                await s3.upload({ Bucket: 'dennis-ha-target', Key: targetKey, Body: transformedContent }).promise();

                console.log(`Datei "${key}" erfolgreich verarbeitet und in "dennis-ha-target" Bucket hochgeladen.`);
            } else {
                console.log(`Die hochgeladene Datei "${key}" ist keine Textdatei. Die Funktion wird abgebrochen.`);
            }
        } else if (event.Records[0].eventName.startsWith('ObjectRemoved')) {
            // Datei wurde im Quell-Bucket gelöscht

            const targetKey = `${key.split('.')[0]}_`; // Anpassen, um die korrekte Ziel-Datei zu identifizieren
            await s3.deleteObject({ Bucket: 'dennis-ha-target', Key: targetKey }).promise();

            console.log(`Datei "${key}" erfolgreich gelöscht im "dennis-ha-target" Bucket.`);
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
