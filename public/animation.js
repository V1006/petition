let tl = gsap.timeline({ defaults: { ease: Expo.easeOut } });
console.log(gsap);
const bg = document.querySelector(".bg");

tl.to(".bg", {
    scale: 1,
    duration: 1.5,
    opacity: 1,
    delay: 0.3,
    ease: Expo.easeOut,
}).from(".earth", {
    duration: 1.5,
    opacity: 0,
});

bg.addEventListener("click", handleClick);

function handleClick() {
    tl.to(".filler", { opacity: 1, duration: 2, stagger: 0.5 })
        .to(
            ".bg",
            {
                clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
            },
            "-=2"
        )
        .to(".landingPageButtons", { opacity: 1, duration: 2 })
        .to(
            ".mainBG",
            {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
        url("/bg.png")`,
                duration: 3,
            },
            "-=1.5"
        );
}
