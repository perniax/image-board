console.log("Sanity check!!");

(function() {
    new Vue({
        el: "#main",
        data: {
            //showModal is what links this Vue with the Component(s), and its linked to the tag image-modal tag in HTML
            showModal: false,
            //this comes from the showModalMethod fn
            // showPics: true,
            //imgs[] part one, the array of pictures display at the begining / part 1
            imgs: [],
            //imageId part 3, the images fo the modal (comes from get(/detail))
            imageId: "",
            // comment: "",
            username: [],
            title: "",
            description: "",

            file: null,
            url: ""
        },
        //********class*****

        // },    <---check this!!!
        ///*******
        mounted: function() {
            console.log("my vu has mounted");
            // console.log("img is: ", this.imgs);
            var me = this;
            //to be able to access "this" after the 'then' we have to declare a variable, in this case "me"
            axios.get("/images").then(function(response) {
                console.log(
                    "This is my response! for the initial get('/images')",
                    response
                );
                // console.log("this.img in then", this.imgs);
                // console.log("this.img in then", me.imgs);
                // console.log("To see the array with the imgs", response.data);
                //response.data is the resp that comes from the get request to the DB and now we stored locally;

                me.imgs = response.data;
                ///*********************************
            });
        },
        methods: {
            handleClick: function(e) {
                let me = this;
                e.preventDefault();
                //to prevent the Submit to try to take us to other GET
                console.log("this: ", this);

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        console.log("resp from axios post upload: ", resp);
                        console.log(
                            "resp.data from axios post upload: ",
                            resp.data
                        );

                        //*************
                        me.imgs.unshift(resp.data);
                        console.log("response from post /upload:", resp);
                    })
                    .catch(function(err) {
                        console.log("error in post /upload: ", err);
                    });
            },
            //// **HERE COMES THE AXIOS getMoreButton THAT IS TRIGGERED BY THAT BUTTON
            clickMore: function(e) {
                e.preventDefault();
                console.log();

                var me = this;
                console.log("clickMore method is running!");
                console.log("this.imgs from axios.getMore", this.imgs);

                // [this.imgs.length - 1] = index of the last image
                // this.imgs[this.imgs.length - 1].id = id of the image with the last index to be shown

                //pics are also the result from the pp.get("/getmore/:id") on index.js,
                // are linked cause they belong to he same route

                axios
                    .get("/getmore/" + this.imgs[this.imgs.length - 1].id)
                    .then(function(pics) {
                        console.log("response from axios.getMore: ", pics);
                        console.log(
                            "response.data from axios.getMore: ",
                            pics.data
                        );
                        //now we can unshift/unshift this data into imgs[]
                        // spread: ... , to insert all the objects of the array that is coming
                        me.imgs.push(...pics.data);
                        console.log(
                            "me.imgs from axios getmore after push/spread :",
                            me.imgs
                        );
                    });
            },
            //**************
            showModalMethod: function(image) {
                //this activates the click on the html, changing to TRUE in showModal in data (in Vue, see top)
                //'this' gives us access to all the properties in data
                this.showModal = true;
                //we pass an arg on the showModalMethod in HTML so,
                // and to this function we pass and arg aswell, that refers to the image that the user clicked on
                console.log("image: ", image);
                console.log("this: ", this);
                //and we want now to store this 'image' in data
                this.imageId = image;
                //this.image refers to the data property in data, and 'image refers to the variable in this function'
            },
            //**************
            closeModalOnParent: function() {
                console.log("closeModalOnParent running");
                //here you can safely close the modal
                this.showModal = false;
            },
            //***************
            handleChange: function(e) {
                // console.log("handleChange is running!");
                // //this is how we target the spacific file that we want to upload
                console.log("file: ", e.target.files[0]);
                // //now to put the selected file inside 'data' inside the property 'file'
                this.file = e.target.files[0];
            },
            myFunction: function(imgs) {
                console.log("myFunction is running!", imgs);
            },
            myNextMethodFunction: function() {
                console.log("another method");
            }
        }
    });
    //**end of Viu Instance***

    //****VUE COMPONENT**child**:

    Vue.component("image-modal", {
        //data, methods, mounted
        template: "#image-modal-template",
        //data is a function that returns a diferente object everytime, if it was static would be always the same component..
        // if you jus want to display the same object/content we could just put an object there
        //mounted works the same as mounted in Vue instance
        //** the property of the Vue instance that we want the component to have, in this case, 'image'
        //props has to be an array!
        props: ["imageId", "showModal"],
        //after 'prop' we can start working again on <image-modal v-if='showModal'></image-modal> in html, so:
        //:image -->props: ["image"] that we just pass to the component // property in the component,
        //:if the prop: ["imageName"] has capital letters in HTML should be 'image-name', just for the Left side
        //by default is an empty array, so we make it equal to the right side :image='image'
        //'image' on the right side of the html, refers to the image that the user clicked,
        data: function() {
            return {
                image: "",
                comment: "",
                username: "",
                url: "",
                comments: []
            };
        },
        mounted: function() {
            var me = this;

            axios.get("/detail/" + this.imageId).then(function(response) {
                console.log("This is my response!", response);
                //response.data will contain the data from db.getdetail

                me.image = response.data;
                console.log("me.imgs: ", me.image);
            });
            //*************
            axios.get("/comments/" + this.imageId).then(function(response) {
                console.log("response from /comments: ", response);
                console.log("response from /comments.data: ", response.data);
                //then store the data from the response
                me.comments = response.data;
                console.log("me.comment: ", me.comments);
            });
            //*************
            //runs when the fn is rendering
            console.log("this in component: ", this);
            //now that the component knows what image was clicked, we could request the info in order to render it
            //we could do know this.'property in props', in this case this.image and access to properties.
            // console.log("mounted from image-modal component is running!");
        },
        methods: {
            closeModal: function() {
                // console.log("closeModal running");
                this.$emit("close");
            },
            //methods are event handelers
            myClick: function() {
                console.log("myClick method is running!");
            },
            // clickMore: function() {
            //     console.log("clickMore button");
            // },
            handleClick: function(e) {
                e.preventDefault();
                console.log("this: ", this);
                //******************
                // the 2nd argument of the post, will be a js object that defines the comment and user to be passed
                let commentData = {
                    comment: this.comment,
                    username: this.username,
                    id: this.imageId
                };
                console.log(
                    "data/input to pass on the post - body for the post in index: ",
                    commentData
                );

                var me = this;

                axios
                    .post("/comments", commentData)
                    .then(function(resp) {
                        console.log("response from post /comments:", resp);
                        //***access to the data comments[] and the unshift it
                        console.log(
                            "me.comments from axios post /comments: ",
                            me.comments
                        );
                        me.comments.unshift(resp.data);
                    })
                    .catch(function(err) {
                        console.log("error in post /comments: ", err);
                    });
                //*********
            }
        }
    });
})();
