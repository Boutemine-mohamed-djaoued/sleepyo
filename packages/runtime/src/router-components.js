import { defineComponent } from "./component";
import { hElement, hSlot } from "./h";

export const RouterLink = defineComponent({
  render() {
    const { to } = this.props;

    return hElement(
      "a",
      {
        href: to,
        on: {
          click: (e) => {
            e.preventDefault();
            this.appContext.router.navigateTo(to);
          },
        },
      },
      [hSlot()]
    );
  },
});

export const RouterOutlet = defineComponent({
  state() {
    return {
      matchedRoute: null,
      subscription: null,
    };
  },

  onMounted() {
    const subscription = this.appContext.router.subscribe(({ to }) => {
      this.handleRouteChange(to);
    });

    this.updateState({ subscription });
  },

  onUnmounted() {
    const { subscription } = this.state;
    this.appContext.router.unsubscribe(subscription);
  },

  handleRouteChange(matchedRoute) {
    this.updateState({ matchedRoute });
  },

  render() {
    const { matchedRoute } = this.state;
    return hElement("div", { id: "router-outlet" }, [
      matchedRoute
        ? hElement(this.appContext.router.matchedRoute.component)
        : null,
    ]);
  },
});
