export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
};

const resizeCallbacks = new Set();

function updateSizes() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

    resizeCallbacks.forEach((callback) => {
        callback(sizes);
    });
}

export function onResize(callback) {
    resizeCallbacks.add(callback);

    return function removeResizeListener() {
        resizeCallbacks.delete(callback);
    };
}

window.addEventListener("resize", updateSizes);
