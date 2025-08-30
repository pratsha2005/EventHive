import User from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId; // ensure auth middleware sets this
        const user = await User.findById(userId).lean();
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
