from typing import TypedDict

from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_core.messages import HumanMessage

class EvalState(TypedDict):
    request: str
    draft: str
    feedback: str
    accepted: bool
    attempts: int


def generator(state: EvalState):
    """
    This function would make an LLM call,
    we are faking that by generating a string
    of n length where the length of the input
    is used as the input value to the collatz
    function.
    """
    draft = state["draft"]

    if len(state["draft"]) == 0:
        draft = state["request"]

    if (len(state["draft"]) % 2) == 0:
        return {
            **state,
            "draft": "*" * (len(draft) // 2)
        }

    return {
        **state,
        "draft": "*" * ((len(draft) * 3) + 1)
    }


def evaluator(state: EvalState):
    """
    This is mocking a step where you would use
    a model to evaluate how good your generated
    content was.  E.g. you could use a model with
    access to linters or other tools to give
    feedback to the generator agent.
    """
    return {
        **state,
        "feedback": "Value too long" if len(state["draft"]) > 1 else "Value just right",
        "accepted": len(state["draft"]) == 1,
        "attempts": state["attempts"] + 1
    }


def router(state: EvalState):
    """
    Your router needs to check if you have
    reached max iterations or if your evaluator
    passed the response and then route to the
    correct node.
    """
    print(state)

    if state["accepted"]:
        return "pass"

    if state["attempts"] >= 10:
        return "max_iter"

    return "fail"
    

eval_graph: StateGraph = StateGraph(EvalState)

eval_graph.add_node("gen", generator)
eval_graph.add_node("eval", evaluator)

eval_graph.add_edge(START, "gen")
eval_graph.add_edge("gen", "eval")

eval_graph.add_conditional_edges(
    "eval",
    router,
    {
        "pass": END,
        "max_iter": END,
        "fail": "gen"
    }
)

graph = eval_graph.compile()


if __name__ == "__main__":
    initial_state: EvalState = {
        "request": input("Enter a number of chars: "),
        "accepted": False,
        "attempts": 0,
        "draft": "",
        "feedback": ""
    }
    graph.invoke(initial_state)
