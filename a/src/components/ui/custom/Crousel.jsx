import React from "react";
import { Autoplay,Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function Crousel() {
  const banners = [
    "www.tarinika.in/cdn/shop/files/Web_Banner-04_3ca5ea7e-db3b-406a-b39c-3b9896c5eb70_1600x.webp?v=1712925178",
    "https://daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.jpg",
    "https://daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.jpg",
    "https://www.tarinika.in/cdn/shop/files/Web_Banner-04_3ca5ea7e-db3b-406a-b39c-3b9896c5eb70_1600x.webp?v=1712925178"
  ];
  return (
    <div className="carousel w-full rounded-box  ">
      <Swiper 
        modules={[Autoplay,Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={50}
        slidesPerView={1}
        autoplay={{delay:1000}}
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        onSwiper={(swiper) => console.log(swiper)}
        onSlideChange={() => console.log("slide change")}
      >
        {banners.map((ele) => {
          return (
            <SwiperSlide>
              <img  src={ele} className="w-full h-full" />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
