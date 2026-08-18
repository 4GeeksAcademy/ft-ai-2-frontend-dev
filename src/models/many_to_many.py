from typing import List

from sqlmodel import Relationship, SQLModel, Field


class StoreToProduct(SQLModel, table=True):
    store_id: int | None = Field(default=None, foreign_key="store.id", primary_key=True)
    product_id: int | None = Field(default=None, foreign_key="product.id", primary_key=True)


class StoreBase(SQLModel):
    name: str


class Store(StoreBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    products: list["Product"] = Relationship(
        link_model=StoreToProduct
    )


class ProductBase(SQLModel):
    name: str
    sku: str


class Product(ProductBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    stores: list["Store"] = Relationship(
        link_model=StoreToProduct
    )
