export function createRecruitmentMapController({ data, view }) {
  return {
    init() {
      view.render(data);
    }
  };
}
