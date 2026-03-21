const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect("mongodb://127.0.0.1:27017/test_gogreen_temp").then(async () => {
    const TestSchema = new Schema({
        status: String,
        assignments: [{
            status: String,
            startTime: Date
        }]
    });
    const Test = mongoose.model("TestArrayFilter", TestSchema);
    
    // Create new with empty assignments
    const doc = await Test.create({ status: "pending", assignments: [] });
    
    try {
        const updateQuery = {
            $set: {
                status: "started",
                "assignments.$[active].status": "started",
                "assignments.$[active].startTime": new Date()
            }
        };

        const res = await Test.findByIdAndUpdate(doc._id, updateQuery, {
            new: true,
            arrayFilters: [{ "active.status": { $ne: "removed" } }]
        });
        console.log("SUCCESS:", res);
    } catch (e) {
        console.log("ERROR:", e.message);
    }
    await mongoose.connection.close();
});
