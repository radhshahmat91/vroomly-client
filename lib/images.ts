/**
 * Photography is free-to-use stock from Pexels (https://www.pexels.com) — credited in the footer.
 * Every <img> in the app goes through <SmartImage /> which falls back to a local illustration if a link breaks.
 */
export const px = (path: string, w = 1200) => `https://images.pexels.com/photos/${path}?auto=compress&cs=tinysrgb&w=${w}`;
const P = (id: number) => `${id}/pexels-photo-${id}.jpeg`;
const S = (id: number, slug: string) => `${id}/pexels-photo-${id}/free-photo-of-${slug}.jpeg`;

export const PLACEHOLDER = "/images/car-placeholder.svg";

export const images = {
  hero: px(P(5543518), 2000),
  heroSecondary: px(P(210019), 1400),
  hostCta: px(P(3954213), 1400),
  closing: px(P(3758443), 1800),
  authPanel: px(P(2932801), 1400),
  categories: {
    sedan: px(S(18569455, "a-black-tesla-model-3-is-parked-on-the-street"), 700),
    suv: px(S(18207329, "view-of-a-mitsubishi-pajero-driving-on-a-dirt-road"), 700),
    hatchback: px(S(27576117, "smart-fortwo"), 700),
    sports: px(P(5543497), 700),
    luxury: px(S(33268786, "sleek-white-sports-car-in-dark-garage-setting"), 700),
    convertible: px(P(2932807), 700),
    offroad: px(P(14512047), 700),
    electric: px(P(9482560), 700),
  } as Record<string, string>,
};
