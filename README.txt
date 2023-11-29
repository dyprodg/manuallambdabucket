1. Buckets erstellen:
aws s3api create-bucket --bucket dennis-ha-target  --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1
aws s3api create-bucket --bucket dennis-ha-source  --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1


2. Funktion schreiben

3. package.json schreiben

???4. npm install ???

5. zip -r s3lambda.zip index.js package.json

6. trust-policy.json schreiben

7. Rolle erstellen

aws iam create-role \
    --role-name lambda-s3-execution-role \
    --assume-role-policy-document file://trust-policy.json


8. Richtlinie erstellen

aws iam create-policy \
    --policy-name s3-permission-policy \
    --policy-document file://s3-permission.json

9. Richtlinie Anhaengen 

aws iam attach-role-policy \
    --role-name lambda-s3-execution-role \
    --policy-arn ARN_DER_ERSTELLTEN_RICHTLINIE


10. Lambda upload:

aws lambda create-function \
    --function-name TextFileProcessor \
    --runtime nodejs14.x \
    --role arn:aws:iam::283919506801:role/lambda-s3-execution-role \
    --handler index.handler \
    --zip-file fileb://s3lambda.zip \
    --region eu-central-1

11. Lambda Trigger 

aws lambda add-permission \
    --function-name TextFileProcessor \
    --statement-id s3-trigger \
    --action "lambda:InvokeFunction" \
    --principal s3.amazonaws.com \
    --source-arn arn:aws:s3:::dennis-ha-source


12. Testdatei Hochladen

aws s3 cp test.txt s3://dennis-ha-source/

13. Checken obs geklappt hat

aws s3 ls s3://dennis-ha-target/

falls haesslich

aws s3 ls s3://dennis-ha-target/ --human-readable
