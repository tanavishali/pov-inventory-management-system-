const mongoose = require('mongoose');

const uri = 'mongodb+srv://tanawish:5271alrai@cluster0.eno7z4q.mongodb.net/authDB?retryWrites=true&w=majority';

async function main() {
  try {
    await mongoose.connect(uri);
    console.log('Connected successfully!');
    
    const connection = mongoose.connection;
    const Udhar = connection.model('Udhar', new mongoose.Schema({
      id: String,
      shopId: mongoose.Schema.Types.ObjectId
    }, { collection: 'udhars' }));

    const shopId = '6a155624a3f79d185d430301';
    const id = '101';

    console.log(`Executing deleteOne with id: "${id}", shopId: "${shopId}"...`);
    const result = await Udhar.deleteOne({ id, shopId }).exec();
    console.log('Result:', result);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
