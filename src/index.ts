import {
    BedrockClient,
    ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";


const REGION = 'eu-west-1'
const client = new BedrockClient({ region: REGION })
const runtimeClient = new BedrockRuntimeClient({ region: REGION });

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

async function loadModels() {

    console.log("Loading models");


    const command = new ListFoundationModelsCommand({});
    const response = await client.send(command);
    const models = response.modelSummaries;

    if (!models) {
        console.log("No models");
        return;
    }

    for (const model of models) {
        console.log("=".repeat(42));
        console.log(` Model: ${model.modelId}`);
        console.log("-".repeat(42));
        console.log(` Name: ${model.modelName}`);
        console.log(` Provider: ${model.providerName}`);
        console.log(` Model ARN: ${model.modelArn}`);
        console.log(` Input modalities: ${model.inputModalities}`);
        console.log(` Output modalities: ${model.outputModalities}`);
        console.log(` Supported customizations: ${model.customizationsSupported}`);
        console.log(` Supported inference types: ${model.inferenceTypesSupported}`);
        console.log(`${"=".repeat(42)}\n`);
    }

}

/**
 * We're going to invoke the following model: 
 * ==========================================
 *  Model: meta.llama3-2-1b-instruct-v1:0
 * ------------------------------------------
 *  Name: Llama 3.2 1B Instruct
 *  Provider: Meta
 *  Model ARN: arn:aws:bedrock:eu-west-1::foundation-model/meta.llama3-2-1b-instruct-v1:0
 *  Input modalities: TEXT
 *  Output modalities: TEXT
 *  Supported customizations:
 *  Supported inference types: INFERENCE_PROFILE
 * ==========================================
 */
async function invokeModel() {

    const modelId = "meta.llama3-2-1b-instruct-v1:0";
    const userMessage = "Describe the purpose of a 'hello world' program in one sentence.";

    // Embed the message in Llama 3's prompt format.
    const prompt = `
    <|begin_of_text|><|start_header_id|>user<|end_header_id|>
    ${userMessage}
    <|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>
    `;

    // Format the request payload using the model's native structure.
    const request = {
        prompt,
        // Optional inference parameters:
        max_gen_len: 512,
        temperature: 0.5,
        top_p: 0.9,
    };

    // Encode and send the request.
    const response = await runtimeClient.send(
        new InvokeModelCommand({
            contentType: "application/json",
            body: JSON.stringify(request),
            modelId,
        }),
    );

    const nativeResponse = JSON.parse(new TextDecoder().decode(response.body));

    const responseText = nativeResponse.generation;
    console.log(responseText);
}

// loadModels()
invokeModel()