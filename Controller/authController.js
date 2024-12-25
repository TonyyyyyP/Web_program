import passport from "../Config/Passport.js";

const authController = {
  githubLogin: passport.authenticate("github", { scope: ["user:email"] }),

  githubCallback: (req, res, next) => {
    passport.authenticate("github", async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/login");
      }

      try {
        const imgBase64 = user.img
          ? `data:image/png;base64,${Buffer.from(user.img).toString("base64")}`
          : null;
        console.log(imgBase64)
        req.session.auth = true;
        req.session.authUser = {
          id: user.id,
          username: user.username,
          name: user.name,
          phoneNumber: user.phoneNumber,
          dob: user.dob,
          permission: user.permission,
          img: imgBase64,
        };

        const retUrl = req.session.retUrl || "/";
        req.session.retUrl = null; 

        res.redirect(retUrl); 
      } catch (error) {
        console.error("Error in GitHub callback:", error);
        res.status(500).json({
          message: "Server error during authentication",
        });
      }
    })(req, res, next);
  },
};


export default authController;
