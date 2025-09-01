module.exports = function(io) {
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("update-student", (data) => {
            io.emit("student-updated", data);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};
