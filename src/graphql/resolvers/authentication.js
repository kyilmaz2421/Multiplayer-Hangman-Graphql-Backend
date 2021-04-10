const User = require('../../models/user');

module.exports = {
    
    signUp: async (args, {req}) => {
        try {
            const user = new User(args);
            if (await User.findOne({ username: user.username })) {
                return { username: null, id: null, error: "This username is already in use"};
            }
            await user.save();
            req.session.user = {id:user.id, username: user.username}
            return { username: user.username, id: user._id, error: null};
        } catch (e) {
            if (e.errors.password) {
                return { username: null, id: null, error: e.errors.password.message};
            }
            return { username: null, id: null, error: "Server error"};
          }
    },

    login: async ({username, password}, {req}) => {
        try{
            const { user, error } = await User.findByCredentials(username, password);
            if (!user) {
                return { username: null, id: null, error};
            }
            req.session.user =  {id:user.id, username: user.username};
            return { username: user.username, id: user._id, error: null};
        } catch (e) {
            return { username: null, id: null, error: "Server error"};
        }
    },

    logout: async ({_id}, {req}) =>{
        try{
            if (await User.findOne({ _id}) && req.session.user) {
                await req.session.destroy();
                return { username: null, id: null, error: null}
            }
            return { username: null, id: null, error: null}
        }catch(e){
            return { username: null, id: null, error: "Server error"}
        }
    },

    isUserLoggedIn: async (args, {req}) => {
        console.log("loggedin: ",req.session.user)
        if (req.session.user) {
            return { username: req.session.user.username, id: req.session.user.id, error: null}
        }else{
            return { username: null, id: null, error: "User is not logged in"}
        }
    }
  };
  