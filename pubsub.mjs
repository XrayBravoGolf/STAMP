// Imports the Google Cloud client library
import { PubSub } from '@google-cloud/pubsub';
export default quickstart;
async function quickstart(
    keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS,
    projectId = process.env.CLOUDPROJ_ID,
    topicNameOrId = process.env.CLOUDPROJ_TOPIC_ID,
    subscriptionName =  process.env.CLOUDPROJ_SUB_ID
) {
    // Instantiates a client
    const pubsub = new PubSub({ projectId, keyFilename});
    const topic = pubsub.topic(topicNameOrId);
    // const topic = pubsub.topic(topicNameOrId);
    // const [subscription] = 

    //   // Creates a new topic
    //   const [topic] = await pubsub.createTopic(topicNameOrId);
    //   console.log(`Topic ${topic.name} created.`);


    // Receive callbacks for new messages on the subscription
    subscription.on('message', message => {
        console.log('Received message:', message.data.toString());
        process.exit(0);
    });

    // Receive callbacks for errors on the subscription
    subscription.on('error', error => {
        console.error('Received error:', error);
        process.exit(1);
    });

    // Send a message to the topic
    topic.publish(Buffer.from('Test message!'));
}