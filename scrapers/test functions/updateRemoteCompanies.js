import mongoose from "mongoose";
import connectDB from "../../utils/db.js"; // Adjust path as needed
import { Careers } from "../../models/careers.model.js";

const remoteCompanies = new Set([
  "Komoot", "Metabase", "On The Go Systems", "MailerLite",
  "Awesome Motive", "Buffer", "Doist", "Float", "Appwrite",
  "Calamari", "Daily Dev", "37signals", "9fin", "Filestage",
  "Yodo1", "GivePanel", "showd.me", "BindHQ", "Percs",
  "Gelato Network", "Drift Labs", "Mango Languages",
  "Livingston Research", "Stack Builders", "Silent Push Inc.",
  "SafetyWing", "GooseChase", "Bunny Studio", "Parabol",
  "MyPlace", "Digital Reach Online Solutions", "Claap",
  "Rock", "Hacker Paradise", "The Remote Company Inc",
  "Meister", "Omnipresent", "Revenue AI", "Rise",
  "Paradime Labs", "Adapty", "cuid", "Mino Games"
]);

const updateRemoteStatus = async () => {
  await connectDB();

  try {
    const allCareers = await Careers.find({});

    for (const career of allCareers) {
      const isRemote = remoteCompanies.has(career.companyName);
      await Careers.updateOne({ _id: career._id }, { remote: isRemote });
      console.log(`Updated ${career.companyName}: remote=${isRemote}`);
    }

    console.log("✅ Remote status updated successfully!");
  } catch (error) {
    console.error("❌ Error updating remote status:", error);
  } finally {
    mongoose.connection.close();
  }
};

updateRemoteStatus();
