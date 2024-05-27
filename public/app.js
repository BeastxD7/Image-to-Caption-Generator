document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("dropArea");
    const imageInput = document.getElementById("imageInput");
    const browseButton = document.getElementById("browseButton");
    const imagePreview = document.getElementById("imagePreview");

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
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    browseButton.addEventListener("click", () => {
        imageInput.click();
    });

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        handleFile(file);
    });

    async function handleFile(file) {
        const formData = new FormData();
        formData.append("file", file);
    
        // Resize image to specific dimensions
        const maxImageWidth = 800; // Set your desired maximum width
        const maxImageHeight = 600; // Set your desired maximum height
    
        const img = new Image();
        const reader = new FileReader();
    
        reader.onload = function (e) {
            img.onload = function () {
                const canvas = document.createElement('canvas');
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
    
                // Display resized image preview
                imagePreview.src = dataUrl;
                imagePreview.classList.remove("hidden"); // Show the image preview
            };
    
            img.src = e.target.result;
        };
    
        reader.readAsDataURL(file);
    
        // Remove caption when new image is uploaded
        document.getElementById("caption").innerText = "";
        return formData;
    }
    
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('generateCaption').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageInput');
    if (fileInput.files.length === 0) {
        alert('Please select an image file.');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5000/caption', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('caption').innerText = data.caption;
    } catch (error) {
        console.error(error);
        document.getElementById('caption').innerText = 'Failed to generate caption.';
    }
});
