from pprint import pprint

from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_core.messages import HumanMessage


def classifier(state: MessagesState):
    # pprint(state)
    most_recent: HumanMessage = next(filter(
        lambda x: type(x) is HumanMessage,
        state['messages'][::-1],
    ))

    if "cs" in most_recent.text.lower():
        return "cs_bot"
    elif "product" in most_recent.text.lower():
        return "prod_bot"
    elif "strategy" in most_recent.text.lower():
        return "strat_bot"
    else:
        return None


def class_bot(state: MessagesState):
    # pprint(state)
    return {
        "messages": [
            *state["messages"],
            {
                "role": "ai",
                "content": "How can I help you?"
            },
        ]
    }


def cs_bot(state: MessagesState):
    # pprint(state)
    return {
        "messages": [
            *state["messages"],
            {
                "role": "ai",
                "content": "I am here to help."
            },
        ]
    }


def prod_bot(state: MessagesState):
    # pprint(state)
    return {
        "messages": [
            *state["messages"],
            {
                "role": "ai",
                "content": "prodbot says this item is high quality wares that are not stolen why would you ask."
            },
        ]
    }


def strat_bot(state: MessagesState):
    # pprint(state)
    return {
        "messages": [
            *state["messages"],
            {
                "role": "ai",
                "content": "stratbot says stock this stuff."
            },
        ]
    }


def synthesis(state: MessagesState):
    # pprint(state)
    # Find the most recent AI message from a specialist bot
    ai_messages = [
        m for m in state["messages"]
        if isinstance(m, dict) and m.get("role") == "ai"
        or hasattr(m, "type") and m.type == "ai"
    ]
    last_ai = ai_messages[-1] if ai_messages else None

    # Determine which bot handled it, for a nice fake summary
    content = ""
    if last_ai:
        content = last_ai.get("content", "") if isinstance(last_ai, dict) else last_ai.content

    return {
        "messages": [
            *state["messages"],
            {
                "role": "ai",
                "content": f"🤖 Synthesis: All handled! Want help with anything else? (type 'done' to exit)"
            },
        ]
    }


router_graph = StateGraph(MessagesState)

router_graph.add_node(class_bot)
router_graph.add_node(cs_bot)
router_graph.add_node(strat_bot)
router_graph.add_node(prod_bot)
router_graph.add_node(synthesis)

router_graph.add_edge(START, "class_bot")

router_graph.add_conditional_edges(
    "class_bot",
    classifier,
    {
        "cs_bot": "cs_bot",
        "strat_bot": "strat_bot",
        "prod_bot": "prod_bot",
        None: END,
    }
)

router_graph.add_edge("cs_bot", "synthesis")
router_graph.add_edge("strat_bot", "synthesis")
router_graph.add_edge("prod_bot", "synthesis")
router_graph.add_edge("synthesis", END)

graph = router_graph.compile()

# --- Demo Chat Loop ---

def run_demo():
    print("🤖 Welcome to the Router Bot Demo!")
    print("Type your message below. Try mentioning 'cs', 'product', or 'strategy'.")
    print("Type 'quit', 'exit', 'q', or 'done' to stop.\n")

    config = {"configurable": {"thread_id": "demo-1"}}

    while True:
        user_input = input("👤 You: ").strip()
        if user_input.lower() in ("quit", "exit", "q", "done"):
            print("👋 Goodbye!")
            break

        print()
        for event in graph.stream(
            {"messages": [HumanMessage(content=user_input)]},
            config,
        ):
            # Each event is a dict keyed by node name, e.g. {"class_bot": {...}}
            for node_name, output in event.items():
                if "messages" in output and output["messages"]:
                    last_msg = output["messages"][-1]
                    if isinstance(last_msg, dict) and last_msg.get("role") == "ai":
                        print(f"  🤖 {node_name}: {last_msg['content']}")
                    elif hasattr(last_msg, "type") and last_msg.type == "ai":
                        print(f"  🤖 {node_name}: {last_msg.content}")
        print()


if __name__ == "__main__":
    run_demo()
