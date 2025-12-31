import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Dùng useAppDispatch thay vì useDispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// Dùng useAppSelector thay vì useSelector (đã có sẵn type RootState)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
