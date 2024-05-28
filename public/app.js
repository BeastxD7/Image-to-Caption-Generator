document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("dropArea");
    const imageInput = document.getElementById("imageInput");
    const browseButton = document.getElementById("browseButton");
    const imagePreview = document.getElementById("imagePreview");
    const generateCaptionButton = document.getElementById("generateCaption");

    let selectedFile = null;

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("border-blue-500");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("border-blue-500");
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("border-blue-500");
        selectedFile = e.dataTransfer.files[0];
        previewImage(selectedFile);
    });

    browseButton.addEventListener("click", () => {
        imageInput.click();
    });

    imageInput.addEventListener("change", () => {
        selectedFile = imageInput.files[0];
        previewImage(selectedFile);
    });

    generateCaptionButton.addEventListener("click", () => {
        if (selectedFile) {
            uploadAndGenerateCaption(selectedFile);
        } else {
            alert("Please select an image first.");
        }
    });

    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxImageWidth = 800; // Set your desired maximum width
                const maxImageHeight = 600; // Set your desired maximum height

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxImageWidth) {
                        height *= maxImageWidth / width;
                        width = maxImageWidth;
                    }
                } else {
                    if (height > maxImageHeight) {
                        width *= maxImageHeight / height;
                        height = maxImageHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg'); // Use 'image/jpeg' for JPEG format
                imagePreview.src = dataUrl;
                imagePreview.classList.remove("hidden"); // Show the image preview
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);

        // Remove caption when new image is uploaded
        document.getElementById("caption").innerText = "";
    }

    async function uploadAndGenerateCaption(file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:5000/caption", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Upload successful:", responseData);

            // Display the caption in the <p> tag
            document.getElementById('caption').innerText = responseData.caption;
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }
});
